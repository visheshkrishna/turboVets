import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { Roles, RequirePermissions, Permission, RolesGuard, PermissionsGuard, CurrentUser } from '@secure-task-system/auth';
import { UserRole, User, CreateUserDto, UpdateUserDto } from '@secure-task-system/data';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_READ)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('for-assignment')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_READ)
  async findForAssignment() {
    return this.usersService.findForAssignment();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_READ)
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_CREATE)
  async createUser(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: User) {
    return this.usersService.createUser(createUserDto, currentUser);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_UPDATE)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ) {
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @RequirePermissions(Permission.USER_DELETE)
  async deleteUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    return this.usersService.deleteUser(id, currentUser);
  }

  @Put(':id/role')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.USER_UPDATE)
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: UserRole },
    @CurrentUser() currentUser: User
  ) {
    return this.usersService.updateUserRole(id, body.role, currentUser);
  }
}
