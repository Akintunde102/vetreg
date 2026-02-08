import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ActivityLogData {
  organizationId: string;
  vetId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: any;
}

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: ActivityLogData): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          organizationId: data.organizationId,
          vetId: data.vetId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          description: data.description,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }

  async getOrganizationLogs(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { organizationId },
        include: {
          vet: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhotoUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({
        where: { organizationId },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
