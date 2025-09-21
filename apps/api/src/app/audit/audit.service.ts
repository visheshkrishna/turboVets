import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResource } from '@secure-task-system/data';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    resource: AuditResource,
    resourceId: number | null,
    userId: number,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      action,
      resource,
      resourceId: resourceId || undefined,
      userId,
      details,
      ipAddress,
      userAgent,
    });

    await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(
    userId?: number,
    action?: AuditAction,
    resource?: AuditResource,
    page = 1,
    limit = 10,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('auditLog.action = :action', { action });
    }

    if (resource) {
      queryBuilder.andWhere('auditLog.resource = :resource', { resource });
    }

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }
}
