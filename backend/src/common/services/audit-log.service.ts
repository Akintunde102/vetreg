import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogData {
  vetId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          vetId: data.vetId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to create audit log:', error);
    }
  }

  async logMany(data: AuditLogData[]): Promise<void> {
    try {
      await this.prisma.auditLog.createMany({
        data: data.map((item) => ({
          vetId: item.vetId,
          action: item.action,
          entityType: item.entityType,
          entityId: item.entityId,
          metadata: item.metadata,
          ipAddress: item.ipAddress,
          userAgent: item.userAgent,
        })),
      });
    } catch (error) {
      console.error('Failed to create audit logs:', error);
    }
  }
}
