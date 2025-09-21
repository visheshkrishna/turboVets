import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, Organization } from '@secure-task-system/data';
import { RolesGuard, PermissionsGuard } from '@secure-task-system/auth';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
    AuditModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, PermissionsGuard],
  exports: [UsersService],
})
export class UsersModule {}
