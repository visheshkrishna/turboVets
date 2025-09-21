import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { GetAuditLogsQueryDto } from '@secure-task-system/data';
import {
  RequirePermissions,
  PermissionsGuard,
  CurrentUser,
} from '@secure-task-system/auth';
import { Permission } from '@secure-task-system/auth';

@Controller('audit')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @RequirePermissions(Permission.AUDIT_READ)
  async getAuditLogs(
    @Query() queryDto: GetAuditLogsQueryDto,
    @CurrentUser() user: any,
  ) {
    const { page = 1, limit = 10, action, resource, userId } = queryDto;
    
    // Only allow users to see their own audit logs unless they're owners/admins
    const targetUserId = user.role === 'owner' || user.role === 'admin' ? userId : (user as any).id;
    
    return this.auditService.getAuditLogs(
      targetUserId,
      action as any,
      resource as any,
      page,
      limit,
    );
  }
}
