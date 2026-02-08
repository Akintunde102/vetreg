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
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: AuditLogData): Promise<void>;
    logMany(data: AuditLogData[]): Promise<void>;
}
