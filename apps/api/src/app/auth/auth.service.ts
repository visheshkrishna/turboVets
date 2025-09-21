import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, LoginDto, RegisterDto, AuthResponseDto, AuditAction, AuditResource, Organization } from '@secure-task-system/data';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['organization']
    });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role, organizationId: user.organizationId };
    const access_token = this.jwtService.sign(payload);

    // Log successful login
    await this.auditService.log(
      AuditAction.LOGIN,
      AuditResource.AUTH,
      null,
      user.id,
      `User logged in successfully`,
      ipAddress,
      userAgent,
    );

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // another way of making sure there is one owner and others are viewers
    //const userCount = await this.userRepository.count();
    //const role = userCount === 0 ? UserRole.ADMIN : UserRole.VIEWER;

    // Assign all new users the OWNER role
    const role = UserRole.OWNER;
    
    // User role assigned

    let organizationId: number | null = null;

    // Look for existing organization first
    const firstOrg = await this.organizationRepository.findOne({ 
      where: {}, 
      order: { id: 'ASC' } 
    });
    
    if (firstOrg) {
      organizationId = firstOrg.id;
      // User assigned to existing organization
    } else {
      // If no organization exists, create a default one
      // Creating default organization
      const defaultOrg = this.organizationRepository.create({
        name: `${registerDto.firstName} ${registerDto.lastName}'s Organization`,
        description: 'Default organization created for new owner user'
      });
      const savedOrg = await this.organizationRepository.save(defaultOrg);
      organizationId = savedOrg.id;
      // Default organization created
    }

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: role,
      organizationId: organizationId,
    });

    const savedUser = await this.userRepository.save(user);

    // Log user registration
    await this.auditService.log(
      AuditAction.CREATE,
      AuditResource.USER,
      savedUser.id,
      savedUser.id,
      `User registered successfully with role: ${savedUser.role}`,
      ipAddress,
      userAgent,
    );

    // Generate JWT token
    const payload = { email: savedUser.email, sub: savedUser.id, role: savedUser.role, organizationId: savedUser.organizationId };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        organizationId: savedUser.organizationId,
      },
    };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['organization']
    });
  }

  async fixUserOrganization(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.organizationId) {
      return { message: 'User already has an organization' };
    }

    // Create a default organization for this user
    const defaultOrg = this.organizationRepository.create({
      name: `${user.firstName} ${user.lastName}'s Organization`,
      description: 'Default organization created for existing user'
    });
    const savedOrg = await this.organizationRepository.save(defaultOrg);

    // Update user with organization ID
    user.organizationId = savedOrg.id;
    await this.userRepository.save(user);

    // User organization fixed
    return { message: 'User organization fixed successfully' };
  }

  async promoteUser(email: string, newRole: UserRole, promotedBy: User): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new ConflictException('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    await this.userRepository.save(user);

    // Log the promotion
    await this.auditService.log(
      AuditAction.UPDATE,
      AuditResource.USER,
      user.id,
      promotedBy.id,
      `User role changed from ${oldRole} to ${newRole} by ${promotedBy.email}`,
    );

    return { message: `User ${user.email} role updated to ${newRole}` };
  }

  async bootstrapAdmin(user: User): Promise<{ message: string }> {
    // Check if there are any admins in the system
    const adminCount = await this.userRepository.count({
      where: [
        { role: UserRole.ADMIN },
        { role: UserRole.OWNER }
      ]
    });

    if (adminCount > 0) {
      throw new ConflictException('Admin users already exist in the system');
    }

    // Promote the current user to admin
    const oldRole = user.role;
    user.role = UserRole.ADMIN;
    await this.userRepository.save(user);

    // Log the bootstrap
    await this.auditService.log(
      AuditAction.UPDATE,
      AuditResource.USER,
      user.id,
      user.id,
      `User bootstrapped to admin (no admins existed). Role changed from ${oldRole} to ${UserRole.ADMIN}`,
    );

    return { message: `You have been promoted to Admin. No admin users existed in the system.` };
  }

  async debugUsers(): Promise<any> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt']
    });
    const userCount = await this.userRepository.count();
    const adminCount = await this.userRepository.count({
      where: [
        { role: UserRole.ADMIN },
        { role: UserRole.OWNER }
      ]
    });
    
    return {
      totalUsers: userCount,
      adminUsers: adminCount,
      users: users
    };
  }
}
