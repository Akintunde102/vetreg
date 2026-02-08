import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, AuditLogService, ActivityLogService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
