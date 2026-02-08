import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  controllers: [MembershipsController],
  providers: [MembershipsService, AuditLogService, ActivityLogService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
