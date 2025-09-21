import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, CreateUserDto, UpdateUserDto, Organization } from '@secure-task-system/data';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private auditService: AuditService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'organizationId', 'createdAt'],
      relations: ['organization'],
      order: { createdAt: 'ASC' }
    });
  }

  async findForAssignment(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role'],
      order: { firstName: 'ASC', lastName: 'ASC' }
    });
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const adminUsers = await this.userRepository.count({
      where: [
        { role: UserRole.ADMIN },
        { role: UserRole.OWNER }
      ]
    });
    const viewerUsers = await this.userRepository.count({
      where: { role: UserRole.VIEWER }
    });
    const totalOrganizations = await this.organizationRepository.count();

    return {
      totalUsers,
      adminUsers,
      viewerUsers,
      totalOrganizations,
      roleDistribution: {
        owner: await this.userRepository.count({ where: { role: UserRole.OWNER } }),
        admin: await this.userRepository.count({ where: { role: UserRole.ADMIN } }),
        viewer: viewerUsers
      }
    };
  }

  async createUser(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Determine organization
    let organizationId = createUserDto.organizationId;
    if (!organizationId) {
      // Assign to current user's organization by default
      organizationId = currentUser.organizationId;
    }

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.VIEWER,
      organizationId,
    });

    const savedUser = await this.userRepository.save(user);

    // Log user creation
    await this.auditService.log(
      'create' as any,
      'user' as any,
      savedUser.id,
      currentUser.id,
      `User created by ${currentUser.email}`,
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);

    // Log user update
    await this.auditService.log(
      'update' as any,
      'user' as any,
      savedUser.id,
      currentUser.id,
      `User updated by ${currentUser.email}`,
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async deleteUser(id: number, currentUser: User): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-deletion
    if (user.id === currentUser.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    // Prevent deletion of the last admin/owner
    if (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
      const adminCount = await this.userRepository.count({
        where: [
          { role: UserRole.ADMIN },
          { role: UserRole.OWNER }
        ]
      });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin/owner user');
      }
    }

    await this.userRepository.remove(user);

    // Log user deletion
    await this.auditService.log(
      'delete' as any,
      'user' as any,
      id,
      currentUser.id,
      `User deleted by ${currentUser.email}`,
    );

    return { message: 'User deleted successfully' };
  }

  async updateUserRole(id: number, newRole: UserRole, currentUser: User): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    await this.userRepository.save(user);

    // Log role change
    await this.auditService.log(
      'update' as any,
      'user' as any,
      user.id,
      currentUser.id,
      `User role changed from ${oldRole} to ${newRole} by ${currentUser.email}`,
    );

    return { message: `User role updated to ${newRole}` };
  }
}
