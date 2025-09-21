import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLog } from '@secure-task-system/data';
import { PermissionsGuard } from '@secure-task-system/auth';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, PermissionsGuard],
  exports: [AuditService],
})
export class AuditModule {}
