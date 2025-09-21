import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Organization, User, CreateOrganizationDto, UpdateOrganizationDto } from '@secure-task-system/data';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      relations: ['users', 'parent', 'children'],
      order: { createdAt: 'ASC' }
    });
  }

  async findHierarchy(): Promise<Organization[]> {
    // Get all parent organizations (level 1)
    const parentOrgs = await this.organizationRepository.find({
      where: { parentId: IsNull() },
      relations: ['users', 'children', 'children.users'],
      order: { createdAt: 'ASC' }
    });

    return parentOrgs;
  }

  async getOrganizationWithChildren(id: number): Promise<Organization | null> {
    return this.organizationRepository.findOne({
      where: { id },
      relations: ['users', 'parent', 'children', 'children.users'],
    });
  }

  async getAccessibleOrganizations(userOrgId: number): Promise<number[]> {
    // Get user's organization and all its children
    const userOrg = await this.organizationRepository.findOne({
      where: { id: userOrgId },
      relations: ['children']
    });

    if (!userOrg) {
      return [userOrgId];
    }

    const accessibleOrgIds = [userOrgId];
    
    // Add all child organization IDs
    if (userOrg.children) {
      for (const child of userOrg.children) {
        accessibleOrgIds.push(child.id);
      }
    }

    return accessibleOrgIds;
  }

  async getOrganizationStats(): Promise<any> {
    const totalOrganizations = await this.organizationRepository.count();
    const organizationsWithUsers = await this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('org.users', 'user')
      .select('org.id')
      .addSelect('org.name')
      .addSelect('COUNT(user.id)', 'userCount')
      .groupBy('org.id')
      .getRawMany();

    return {
      totalOrganizations,
      organizationsWithUsers,
      averageUsersPerOrg: organizationsWithUsers.length > 0 
        ? organizationsWithUsers.reduce((sum, org) => sum + parseInt(org.userCount), 0) / organizationsWithUsers.length 
        : 0
    };
  }

  async createOrganization(createOrgDto: CreateOrganizationDto, currentUser: User): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrgDto);
    const savedOrg = await this.organizationRepository.save(organization);

    // Log organization creation
    await this.auditService.log(
      'create' as any,
      'organization' as any,
      savedOrg.id,
      currentUser.id,
      `Organization created by ${currentUser.email}`,
    );

    return savedOrg;
  }

  async updateOrganization(id: number, updateOrgDto: UpdateOrganizationDto, currentUser: User): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({ where: { id } });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    Object.assign(organization, updateOrgDto);
    const savedOrg = await this.organizationRepository.save(organization);

    // Log organization update
    await this.auditService.log(
      'update' as any,
      'organization' as any,
      savedOrg.id,
      currentUser.id,
      `Organization updated by ${currentUser.email}`,
    );

    return savedOrg;
  }

  async deleteOrganization(id: number, currentUser: User): Promise<{ message: string }> {
    const organization = await this.organizationRepository.findOne({ 
      where: { id },
      relations: ['users']
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if organization has users
    if (organization.users && organization.users.length > 0) {
      throw new ForbiddenException('Cannot delete organization with existing users');
    }

    await this.organizationRepository.remove(organization);

    // Log organization deletion
    await this.auditService.log(
      'delete' as any,
      'organization' as any,
      id,
      currentUser.id,
      `Organization deleted by ${currentUser.email}`,
    );

    return { message: 'Organization deleted successfully' };
  }
}
