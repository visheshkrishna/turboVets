import { Controller, Post, Body, UseGuards, Get, Request, Req, Patch } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, UserRole } from '@secure-task-system/data';
import { Roles, RequirePermissions, Permission } from '@secure-task-system/auth';
import { RolesGuard, PermissionsGuard } from '@secure-task-system/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: ExpressRequest): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_UPDATE)
  @Patch('promote')
  async promoteUser(
    @Body() body: { email: string; role: UserRole },
    @Request() req: any
  ) {
    return this.authService.promoteUser(body.email, body.role, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('bootstrap-admin')
  async bootstrapAdmin(@Request() req: any) {
    return this.authService.bootstrapAdmin(req.user);
  }

  @Get('debug/users')
  async debugUsers() {
    return this.authService.debugUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('debug/token')
  async debugToken(@Request() req: any) {
    return {
      message: 'Token is valid',
      user: req.user,
      timestamp: new Date().toISOString()
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('fix-organization')
  async fixOrganization(@Request() req: any) {
    return this.authService.fixUserOrganization(req.user.userId);
  }
}
