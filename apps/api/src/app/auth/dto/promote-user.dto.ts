import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '@secure-task-system/data';

export class PromoteUserDto {
  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
