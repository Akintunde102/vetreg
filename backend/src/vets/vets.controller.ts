import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VetsService } from './vets.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalGuard } from '../auth/guards/approval.guard';
import { MasterAdminGuard } from '../auth/guards/master-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipApproval } from '../auth/decorators/skip-approval.decorator';
import type { Vet } from '@prisma/client';

@Controller('vets')
@UseGuards(JwtAuthGuard)
export class VetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Post('profile/complete')
  @SkipApproval()
  async completeProfile(
    @CurrentUser() user: Vet,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.vetsService.completeProfile(user.id, dto);
  }

  @Get('profile')
  @SkipApproval()
  async getProfile(@CurrentUser() user: Vet) {
    return this.vetsService.getProfile(user.id);
  }

  @Get('approval-status')
  @SkipApproval()
  async getApprovalStatus(@CurrentUser() user: Vet) {
    return this.vetsService.getApprovalStatus(user.id);
  }

  // Master Admin endpoints
  @Get('pending-approvals')
  @UseGuards(ApprovalGuard, MasterAdminGuard)
  async getPendingApprovals() {
    return this.vetsService.getPendingApprovals();
  }

  @Patch(':vetId/approve')
  @UseGuards(ApprovalGuard, MasterAdminGuard)
  async approveVet(@CurrentUser() admin: Vet, @Param('vetId') vetId: string) {
    return this.vetsService.approveVet(admin.id, vetId);
  }

  @Patch(':vetId/reject')
  @UseGuards(ApprovalGuard, MasterAdminGuard)
  async rejectVet(
    @CurrentUser() admin: Vet,
    @Param('vetId') vetId: string,
    @Body('reason') reason: string,
  ) {
    return this.vetsService.rejectVet(admin.id, vetId, reason);
  }

  @Patch(':vetId/suspend')
  @UseGuards(ApprovalGuard, MasterAdminGuard)
  async suspendVet(
    @CurrentUser() admin: Vet,
    @Param('vetId') vetId: string,
    @Body('reason') reason: string,
  ) {
    return this.vetsService.suspendVet(admin.id, vetId, reason);
  }

  @Patch(':vetId/reactivate')
  @UseGuards(ApprovalGuard, MasterAdminGuard)
  async reactivateVet(
    @CurrentUser() admin: Vet,
    @Param('vetId') vetId: string,
  ) {
    return this.vetsService.reactivateVet(admin.id, vetId);
  }
}
