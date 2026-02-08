import { Module } from '@nestjs/common';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService, AuditLogService, ActivityLogService],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
