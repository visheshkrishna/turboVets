export class AuthResponseDto {
  access_token!: string;
  user!: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId?: number;
  };
}


export class TaskResponseDto {
  id!: number;
  title!: string;
  description?: string;
  status!: string;
  category!: string;
  priority?: number;
  dueDate?: Date;
  createdById!: number;
  assignedToId?: number;
  organizationId?: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class AuditLogResponseDto {
  id!: number;
  action!: string;
  resource!: string;
  resourceId?: number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: number;
  createdAt!: Date;
}
