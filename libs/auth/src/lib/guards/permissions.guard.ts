import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole, Permission } from '../types/user.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const userPermissions = this.getUserPermissions(user.role);
    
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }

  private getUserPermissions(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      [UserRole.OWNER]: [
        // All permissions
        Permission.TASK_CREATE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE,
        Permission.TASK_DELETE,
        Permission.TASK_ASSIGN,
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.ORG_CREATE,
        Permission.ORG_READ,
        Permission.ORG_UPDATE,
        Permission.ORG_DELETE,
        Permission.AUDIT_READ,
      ],
      [UserRole.ADMIN]: [
        // Most permissions but can only view organizations
        Permission.TASK_CREATE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE,
        Permission.TASK_DELETE,
        Permission.TASK_ASSIGN,
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.ORG_READ,
        Permission.AUDIT_READ,
      ],
      [UserRole.VIEWER]: [
        // Can read and update task status (move cards)
        Permission.TASK_READ,
        Permission.TASK_UPDATE,
        Permission.USER_READ,
        Permission.ORG_READ,
      ],
    };

    return rolePermissions[role] || [];
  }
}
