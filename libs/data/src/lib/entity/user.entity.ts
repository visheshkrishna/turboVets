import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export enum RoleName {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar' })
  firstName!: string;

  @Column({ type: 'varchar' })
  lastName!: string;

  @Column({
    type: 'varchar',
    default: UserRole.VIEWER
  })
  role!: UserRole;

  @Column({ type: 'int', nullable: true })
  organizationId!: number;

  @ManyToOne(() => Organization, organization => organization.users)
  organization!: Organization;

  @OneToMany('Task', 'createdBy')
  createdTasks!: any[];

  @OneToMany('Task', 'assignedTo')
  assignedTasks!: any[];

  @OneToMany('AuditLog', 'user')
  auditLogs!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
