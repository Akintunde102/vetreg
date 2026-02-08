import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, AuditLogService, ActivityLogService],
  exports: [ClientsService],
})
export class ClientsModule {}
