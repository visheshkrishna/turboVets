import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User, Organization } from '@secure-task-system/data';
import { AuditModule } from '../audit/audit.module';
import { RolesGuard, PermissionsGuard } from '@secure-task-system/auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    forwardRef(() => AuditModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, PermissionsGuard],
  exports: [AuthService],
})
export class AuthModule {}
