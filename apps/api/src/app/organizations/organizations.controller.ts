import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from './organizations.service';
import { Roles, RequirePermissions, Permission, RolesGuard, PermissionsGuard, CurrentUser } from '@secure-task-system/auth';
import { UserRole, User, CreateOrganizationDto, UpdateOrganizationDto } from '@secure-task-system/data';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.ORG_READ)
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.ORG_READ)
  async getOrganizationStats() {
    return this.organizationsService.getOrganizationStats();
  }

  @Get('hierarchy')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.ORG_READ)
  async getOrganizationHierarchy() {
    return this.organizationsService.findHierarchy();
  }

  @Get(':id/children')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @RequirePermissions(Permission.ORG_READ)
  async getOrganizationWithChildren(@Param('id', ParseIntPipe) id: number) {
    return this.organizationsService.getOrganizationWithChildren(id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @RequirePermissions(Permission.ORG_CREATE)
  async createOrganization(@Body() createOrgDto: CreateOrganizationDto, @CurrentUser() currentUser: User) {
    return this.organizationsService.createOrganization(createOrgDto, currentUser);
  }

  @Put(':id')
  @Roles(UserRole.OWNER)
  @RequirePermissions(Permission.ORG_UPDATE)
  async updateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrgDto: UpdateOrganizationDto,
    @CurrentUser() currentUser: User
  ) {
    return this.organizationsService.updateOrganization(id, updateOrgDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @RequirePermissions(Permission.ORG_DELETE)
  async deleteOrganization(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    return this.organizationsService.deleteOrganization(id, currentUser);
  }
}
