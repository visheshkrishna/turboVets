import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../types/user.types';

@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceOrganizationId = this.getResourceOrganizationId(request);

    // If no resource organization ID is specified (e.g., for creation), allow access
    if (resourceOrganizationId === null) {
      return true;
    }

    // Check if user has access to the resource organization
    // This includes their own organization and any child organizations
    const hasAccess = this.checkOrganizationAccess(user, resourceOrganizationId);
    
    if (!hasAccess) {
      throw new ForbiddenException('Access denied: Resource belongs to different organization or hierarchy');
    }

    return true;
  }

  private checkOrganizationAccess(user: any, resourceOrganizationId: number): boolean {
    // For now, we'll implement a simple check
    // In a real implementation, this would query the database to check hierarchy
    // Owners and Admins can access resources from their organization and child organizations
    if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) {
      // Allow access to own organization
      if (user.organizationId === resourceOrganizationId) {
        return true;
      }
      
      // TODO: Check if resourceOrganizationId is a child of user.organizationId
      // This would require a database query to check the hierarchy
      // For now, we'll be restrictive and only allow same organization
      return false;
    }

    // Viewers can only access resources from their organization
    if (user.role === UserRole.VIEWER) {
      return user.organizationId === resourceOrganizationId;
    }

    return false;
  }

  private getResourceOrganizationId(request: any): number | null {
    // Try to get organization ID from different sources
    const body = request.body;
    const params = request.params;
    const query = request.query;

    // From request body
    if (body?.organizationId) {
      return parseInt(body.organizationId);
    }

    // From URL params (e.g., /tasks/:id)
    if (params?.id) {
      // This would need to be enhanced to fetch the actual resource
      // For now, we'll assume the user can only access their own org's resources
      return null;
    }

    // From query params
    if (query?.organizationId) {
      return parseInt(query.organizationId);
    }

    return null;
  }
}
