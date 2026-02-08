import { Module } from '@nestjs/common';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  controllers: [AnimalsController],
  providers: [AnimalsService, AuditLogService, ActivityLogService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
