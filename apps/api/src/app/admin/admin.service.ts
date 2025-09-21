import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Organization, Task, UserRole, TaskStatus } from '@secure-task-system/data';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getSystemStats(): Promise<any> {
    const [
      totalUsers,
      totalOrganizations,
      totalTasks,
      usersByRole,
      tasksByStatus,
      recentUsers,
      recentTasks
    ] = await Promise.all([
      this.userRepository.count(),
      this.organizationRepository.count(),
      this.taskRepository.count(),
      this.getUsersByRole(),
      this.getTasksByStatus(),
      this.getRecentUsers(),
      this.getRecentTasks()
    ]);

    return {
      overview: {
        totalUsers,
        totalOrganizations,
        totalTasks,
      },
      usersByRole,
      tasksByStatus,
      recent: {
        users: recentUsers,
        tasks: recentTasks
      }
    };
  }

  async getDashboardData(): Promise<any> {
    const [
      systemStats,
      organizationStats,
      userActivity
    ] = await Promise.all([
      this.getSystemStats(),
      this.getOrganizationStats(),
      this.getUserActivity()
    ]);

    return {
      ...systemStats,
      organizationStats,
      userActivity
    };
  }

  private async getUsersByRole(): Promise<any> {
    const roles = [UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER];
    const roleCounts: Record<string, number> = {};

    for (const role of roles) {
      roleCounts[role] = await this.userRepository.count({ where: { role } });
    }

    return roleCounts;
  }

  private async getTasksByStatus(): Promise<any> {
    const statuses = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELLED];
    const statusCounts: Record<string, number> = {};

    for (const status of statuses) {
      statusCounts[status] = await this.taskRepository.count({ where: { status } });
    }

    return statusCounts;
  }

  private async getRecentUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 5
    });
  }

  private async getRecentTasks(): Promise<Task[]> {
    return this.taskRepository.find({
      select: ['id', 'title', 'status', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: 5
    });
  }

  private async getOrganizationStats(): Promise<any> {
    const organizations = await this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('org.users', 'user')
      .select('org.id')
      .addSelect('org.name')
      .addSelect('COUNT(user.id)', 'userCount')
      .groupBy('org.id')
      .getRawMany();

    return {
      organizations,
      averageUsersPerOrg: organizations.length > 0 
        ? organizations.reduce((sum, org) => sum + parseInt(org.userCount), 0) / organizations.length 
        : 0
    };
  }

  private async getUserActivity(): Promise<any> {
    // Get user activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await this.userRepository.count({
      where: {
        createdAt: {
          $gte: sevenDaysAgo
        } as any
      }
    });

    const recentTasks = await this.taskRepository.count({
      where: {
        createdAt: {
          $gte: sevenDaysAgo
        } as any
      }
    });

    return {
      newUsersLast7Days: recentUsers,
      newTasksLast7Days: recentTasks
    };
  }
}
