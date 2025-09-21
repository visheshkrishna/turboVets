import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, CreateTaskDto, UpdateTaskDto, GetTasksQueryDto, UserRole, TaskCategory, TaskStatus } from '@secure-task-system/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number, userRole: UserRole, organizationId: number): Promise<Task> {
    const task = new Task();
    task.title = createTaskDto.title;
    task.description = createTaskDto.description || '';
    task.category = createTaskDto.category as TaskCategory;
    task.priority = createTaskDto.priority || 1;
    task.dueDate = createTaskDto.dueDate || new Date();
    task.assignedToId = createTaskDto.assignedToId;
    task.createdById = userId;
    task.organizationId = organizationId;
    task.status = TaskStatus.OPEN; // Set default status

    const savedTask = await this.tasksRepository.save(task);
    return savedTask;
  }

  async findAll(queryDto: GetTasksQueryDto, userRole: UserRole, accessibleOrgIds: number[], userId?: number): Promise<{ tasks: Task[]; total: number }> {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      status, 
      category, 
      priority, 
      assignedToId, 
      createdById,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = queryDto;
    
    // Building task query
    
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .where('task.organizationId IN (:...accessibleOrgIds)', { accessibleOrgIds });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (category) {
      queryBuilder.andWhere('task.category = :category', { category });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', { assignedToId });
    }

    if (createdById) {
      queryBuilder.andWhere('task.createdById = :createdById', { createdById });
    }

    // Date range filters
    if (dateFrom) {
      // Convert date string to start of day
      const startDate = new Date(dateFrom);
      startDate.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('task.createdAt >= :dateFrom', { dateFrom: startDate });
    }

    if (dateTo) {
      // Convert date string to end of day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('task.createdAt <= :dateTo', { dateTo: endDate });
    }

    // For viewers, only show tasks assigned to them
    if (userRole === UserRole.VIEWER && userId) {
      queryBuilder.andWhere('task.assignedToId = :userId', { userId });
    }

    // Sorting
    const validSortFields = ['title', 'createdAt', 'updatedAt', 'priority', 'status', 'dueDate'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    queryBuilder.orderBy(`task.${sortField}`, order);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();
    
    // Query executed successfully

    return { tasks, total };
  }

  async findOne(id: number, userRole: UserRole, userId: number, accessibleOrgIds: number[]): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if task belongs to accessible organizations
    if (!accessibleOrgIds.includes(task.organizationId)) {
      throw new ForbiddenException('Access denied: Task belongs to different organization');
    }

    // Viewers can only see tasks assigned to them
    if (userRole === UserRole.VIEWER && task.assignedToId !== userId) {
      throw new ForbiddenException('Access denied: You can only view tasks assigned to you');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userRole: UserRole, userId: number, accessibleOrgIds: number[]): Promise<Task> {
    const task = await this.findOne(id, userRole, userId, accessibleOrgIds);

    // Viewers can only update tasks assigned to them and only certain fields
    if (userRole === UserRole.VIEWER) {
      if (task.assignedToId !== userId) {
        throw new ForbiddenException('Access denied: You can only update tasks assigned to you');
      }
      
      // Viewers can only update status and description
      const allowedFields = ['status', 'description'];
      const updateFields = Object.keys(updateTaskDto);
      const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));
      
      if (hasInvalidFields) {
        throw new ForbiddenException('Access denied: You can only update status and description');
      }
    }

    // Updating task
    
    Object.assign(task, updateTaskDto);
    
    // 👇 CRITICAL FIX: Handle assignedToId update properly
    if (updateTaskDto.assignedToId !== undefined) {
      task.assignedToId = updateTaskDto.assignedToId;
      (task as any).assignedTo = null; // Clear stale relation so TypeORM respects the FK update
      // AssignedToId updated
    }
    
    const savedTask = await this.tasksRepository.save(task);
    
    return savedTask;
  }

  async remove(id: number, userRole: UserRole, userId: number, accessibleOrgIds: number[]): Promise<void> {
    const task = await this.findOne(id, userRole, userId, accessibleOrgIds);

    // Only owners and admins can delete tasks
    if (userRole === UserRole.VIEWER) {
      throw new ForbiddenException('Access denied: You cannot delete tasks');
    }

    await this.tasksRepository.remove(task);
  }
}
