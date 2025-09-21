import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export enum AuditResource {
  TASK = 'task',
  USER = 'user',
  ORGANIZATION = 'organization',
  AUTH = 'auth'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar'
  })
  action!: AuditAction;

  @Column({
    type: 'varchar'
  })
  resource!: AuditResource;

  @Column({ type: 'int', nullable: true })
  resourceId!: number;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress!: string;

  @Column({ type: 'text', nullable: true })
  userAgent!: string;

  @Column({ type: 'int', nullable: true })
  userId!: number;

  @ManyToOne(() => User, user => user.auditLogs)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
