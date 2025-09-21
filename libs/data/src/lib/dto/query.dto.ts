import { IsOptional, IsEnum, IsNumber, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTasksQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['open', 'in_progress', 'done'])
  status?: string;

  @IsOptional()
  @IsEnum(['work', 'personal', 'urgent'])
  category?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  assignedToId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  createdById?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['title', 'createdAt', 'updatedAt', 'priority', 'status', 'dueDate'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsString()
  dateFrom?: string; // ISO date string

  @IsOptional()
  @IsString()
  dateTo?: string; // ISO date string

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class GetAuditLogsQueryDto {
  @IsOptional()
  @IsEnum(['create', 'read', 'update', 'delete', 'login', 'logout'])
  action?: string;

  @IsOptional()
  @IsEnum(['task', 'user', 'organization', 'auth'])
  resource?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
