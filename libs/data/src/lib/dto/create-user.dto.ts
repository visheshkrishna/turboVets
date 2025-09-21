import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../entity/user.entity';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  organizationId?: number;
}
