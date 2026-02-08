import { Module } from '@nestjs/common';
import { VetsController } from './vets.controller';
import { VetsService } from './vets.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Module({
  controllers: [VetsController],
  providers: [VetsService, AuditLogService],
  exports: [VetsService],
})
export class VetsModule {}
