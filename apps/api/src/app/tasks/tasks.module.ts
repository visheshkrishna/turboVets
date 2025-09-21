import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { Task, Organization, User } from '@secure-task-system/data';
import { RolesGuard, PermissionsGuard, OrganizationGuard } from '@secure-task-system/auth';
import { AuditService } from '../audit/audit.service';
import { AuditLog } from '@secure-task-system/data';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Organization, User, AuditLog])],
  controllers: [TasksController],
  providers: [TasksService, OrganizationsService, AuditService, RolesGuard, PermissionsGuard, OrganizationGuard],
  exports: [TasksService],
})
export class TasksModule {}
