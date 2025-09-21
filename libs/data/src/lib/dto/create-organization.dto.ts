import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
