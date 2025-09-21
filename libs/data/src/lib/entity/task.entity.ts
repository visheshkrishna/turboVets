import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  URGENT = 'urgent'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    default: TaskStatus.OPEN
  })
  status!: TaskStatus;

  @Column({
    type: 'varchar',
    default: TaskCategory.WORK
  })
  category!: TaskCategory;

  @Column({ type: 'int', nullable: true })
  priority?: number;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;

  @Column({ type: 'int', nullable: true })
  createdById?: number;

  @ManyToOne(() => User, user => user.createdTasks)
  createdBy!: User;

  @Column({ type: 'int', nullable: true })
  assignedToId?: number;

  @ManyToOne(() => User, user => user.assignedTasks)
  assignedTo!: User;

  @Column({ type: 'int', nullable: true })
  organizationId!: number;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
