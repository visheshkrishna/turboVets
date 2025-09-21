import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { OrganizationsService } from '../organizations/organizations.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  GetTasksQueryDto,
  Task,
  UserRole,
} from '@secure-task-system/data';
import {
  Roles,
  RolesGuard,
  RequirePermissions,
  PermissionsGuard,
  OrganizationGuard,
  CurrentUser,
  CurrentUser as CurrentUserInterface,
} from '@secure-task-system/auth';
import { Permission } from '@secure-task-system/auth';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard, OrganizationGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @RequirePermissions(Permission.TASK_CREATE)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Task> {
    console.log('TasksController: Creating task with DTO:', createTaskDto);
    console.log('TasksController: User info:', user);
    const task = await this.tasksService.create(
      createTaskDto,
      user.userId,
      user.role as UserRole,
      user.organizationId,
    );
    console.log('TasksController: Task created:', task);
    return task;
  }

  @Get()
  @RequirePermissions(Permission.TASK_READ)
  async findAll(
    @Query() queryDto: GetTasksQueryDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<{ tasks: Task[]; total: number }> {
    console.log('TasksController: Getting tasks with query:', queryDto);
    console.log('TasksController: User info:', user);
    
    // Get accessible organization IDs (including child organizations)
    const accessibleOrgIds = await this.organizationsService.getAccessibleOrganizations(user.organizationId);
    console.log('TasksController: Accessible org IDs:', accessibleOrgIds);
    
    const result = await this.tasksService.findAll(queryDto, user.role as UserRole, accessibleOrgIds, user.userId);
    console.log('TasksController: Found tasks:', result);
    return result;
  }

  @Get(':id')
  @RequirePermissions(Permission.TASK_READ)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Task> {
    const accessibleOrgIds = await this.organizationsService.getAccessibleOrganizations(user.organizationId);
    return this.tasksService.findOne(id, user.role as UserRole, user.userId, accessibleOrgIds);
  }

  @Patch(':id')
  @RequirePermissions(Permission.TASK_UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Task> {
    const accessibleOrgIds = await this.organizationsService.getAccessibleOrganizations(user.organizationId);
    return this.tasksService.update(
      id,
      updateTaskDto,
      user.role as UserRole,
      user.userId,
      accessibleOrgIds,
    );
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @RequirePermissions(Permission.TASK_DELETE)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<{ message: string }> {
    const accessibleOrgIds = await this.organizationsService.getAccessibleOrganizations(user.organizationId);
    await this.tasksService.remove(id, user.role as UserRole, user.userId, accessibleOrgIds);
    return { message: 'Task deleted successfully' };
  }
}
