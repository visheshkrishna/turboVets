import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles, RequirePermissions, Permission, RolesGuard, PermissionsGuard } from '@secure-task-system/auth';
import { UserRole } from '@secure-task-system/data';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_READ)
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_READ)
  async getDashboardData() {
    return this.adminService.getDashboardData();
  }
}
