import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { AuditAction, AuditResource } from '@secure-task-system/data';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, user, ip, headers } = request;
    const userAgent = headers['user-agent'];

    // Skip audit logging for certain endpoints
    if (this.shouldSkipAudit(url)) {
      return next.handle();
    }

    const auditInfo = this.getAuditInfo(method, url);
    if (!auditInfo) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Only log if user is authenticated
          if (user && (user as any).id) {
            const resourceId = this.extractResourceId(url, response);
            
            await this.auditService.log(
              auditInfo.action,
              auditInfo.resource,
              resourceId,
              (user as any).id,
              this.buildDetails(method, url, response),
              ip,
              userAgent,
            );
          }
        } catch (error) {
          // Don't let audit logging errors break the main flow
          console.error('Audit logging error:', error);
        }
      }),
    );
  }

  private shouldSkipAudit(url: string): boolean {
    const skipPatterns = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/health',
      '/api/metrics',
    ];
    
    return skipPatterns.some(pattern => url.includes(pattern));
  }

  private getAuditInfo(method: string, url: string): { action: AuditAction; resource: AuditResource } | null {
    // Map HTTP methods and URLs to audit actions and resources
    if (url.includes('/api/tasks')) {
      switch (method) {
        case 'POST':
          return { action: AuditAction.CREATE, resource: AuditResource.TASK };
        case 'GET':
          return { action: AuditAction.READ, resource: AuditResource.TASK };
        case 'PATCH':
        case 'PUT':
          return { action: AuditAction.UPDATE, resource: AuditResource.TASK };
        case 'DELETE':
          return { action: AuditAction.DELETE, resource: AuditResource.TASK };
      }
    }

    if (url.includes('/api/auth/profile')) {
      return { action: AuditAction.READ, resource: AuditResource.AUTH };
    }

    if (url.includes('/api/users')) {
      switch (method) {
        case 'POST':
          return { action: AuditAction.CREATE, resource: AuditResource.USER };
        case 'GET':
          return { action: AuditAction.READ, resource: AuditResource.USER };
        case 'PATCH':
        case 'PUT':
          return { action: AuditAction.UPDATE, resource: AuditResource.USER };
        case 'DELETE':
          return { action: AuditAction.DELETE, resource: AuditResource.USER };
      }
    }

    if (url.includes('/api/organizations')) {
      switch (method) {
        case 'POST':
          return { action: AuditAction.CREATE, resource: AuditResource.ORGANIZATION };
        case 'GET':
          return { action: AuditAction.READ, resource: AuditResource.ORGANIZATION };
        case 'PATCH':
        case 'PUT':
          return { action: AuditAction.UPDATE, resource: AuditResource.ORGANIZATION };
        case 'DELETE':
          return { action: AuditAction.DELETE, resource: AuditResource.ORGANIZATION };
      }
    }

    return null;
  }

  private extractResourceId(url: string, response: any): number | null {
    // Extract resource ID from URL or response
    const urlMatch = url.match(/\/(\d+)(?:\/|$)/);
    if (urlMatch) {
      return parseInt(urlMatch[1]);
    }

    // Try to get ID from response
    if (response && response.id) {
      return response.id;
    }

    return null;
  }

  private buildDetails(method: string, url: string, response: any): string {
    return JSON.stringify({
      method,
      url,
      timestamp: new Date().toISOString(),
      success: true,
    });
  }
}
