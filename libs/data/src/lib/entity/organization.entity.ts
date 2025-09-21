import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string;

  @Column({ type: 'integer', nullable: true })
  parentId!: number;

  @ManyToOne(() => Organization, organization => organization.children)
  parent!: Organization;

  @OneToMany(() => Organization, organization => organization.parent)
  children!: Organization[];

  @OneToMany(() => User, user => user.organization)
  users!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
