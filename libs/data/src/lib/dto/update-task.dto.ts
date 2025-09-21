import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['open', 'in_progress', 'done', 'cancelled'])
  status?: 'open' | 'in_progress' | 'done' | 'cancelled';

  @IsOptional()
  @IsEnum(['work', 'personal', 'urgent'])
  category?: 'work' | 'personal' | 'urgent';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  assignedToId?: number;
}
