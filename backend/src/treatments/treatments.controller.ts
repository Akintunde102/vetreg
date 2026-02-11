import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { DeleteTreatmentDto } from './dto/delete-treatment.dto';
import { MarkPaymentDto } from './dto/mark-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalGuard } from '../auth/guards/approval.guard';
import { OrgScopeGuard } from '../auth/guards/org-scope.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { DeletePermissionGuard } from '../auth/guards/delete-permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireDeletePermission } from '../auth/decorators/delete-permission.decorator';
import { SkipResponseTransform } from '../common/decorators/skip-response-transform.decorator';
import { MembershipRole } from '@prisma/client';
import type { Vet } from '@prisma/client';

@ApiTags('Treatments')
@ApiBearerAuth('access-token')
@Controller('orgs/:orgId/treatments')
@UseGuards(JwtAuthGuard, ApprovalGuard, OrgScopeGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @CurrentUser() user: Vet,
    @Body() dto: CreateTreatmentDto,
  ) {
    return this.treatmentsService.create(orgId, user.id, dto);
  }

  @Get()
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('animalId') animalId?: string,
    @Query('vetId') vetId?: string,
    @Query('status') status?: string,
    @Query('paymentCategory') paymentCategory?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    includeDeleted?: boolean,
  ) {
    return this.treatmentsService.findAll(
      orgId,
      page,
      limit,
      animalId,
      vetId,
      status,
      paymentCategory,
      paymentStatus,
      includeDeleted,
    );
  }

  @Get('scheduled/list')
  async getScheduledTreatments(
    @Param('orgId') orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    return this.treatmentsService.getScheduledTreatments(
      orgId,
      page,
      limit,
      fromDate,
      toDate,
    );
  }

  @Get('scheduled/today')
  @SkipResponseTransform()
  async getScheduledToday(@Param('orgId') orgId: string) {
    return this.treatmentsService.getScheduledToday(orgId);
  }

  @Get('follow-ups/today')
  @SkipResponseTransform()
  async getFollowUpsToday(@Param('orgId') orgId: string) {
    return this.treatmentsService.getFollowUpsToday(orgId);
  }

  @Get('follow-ups')
  @SkipResponseTransform()
  async getFollowUpsInRange(
    @Param('orgId') orgId: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('Query params "from" and "to" (yyyy-MM-dd) are required');
    }
    return this.treatmentsService.getFollowUpsInRange(
      orgId,
      fromDate,
      toDate,
    );
  }

  @Get(':treatmentId')
  async findOne(
    @Param('orgId') orgId: string,
    @Param('treatmentId') treatmentId: string,
  ) {
    return this.treatmentsService.findOne(orgId, treatmentId);
  }

  @Patch(':treatmentId')
  async update(
    @Param('orgId') orgId: string,
    @Param('treatmentId') treatmentId: string,
    @CurrentUser() user: Vet,
    @Body() dto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.update(orgId, treatmentId, user.id, dto);
  }

  @Delete(':treatmentId')
  @UseGuards(RoleGuard, DeletePermissionGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  @RequireDeletePermission('canDeleteTreatments')
  async softDelete(
    @Param('orgId') orgId: string,
    @Param('treatmentId') treatmentId: string,
    @CurrentUser() user: Vet,
    @Body() dto: DeleteTreatmentDto,
  ) {
    return this.treatmentsService.softDelete(orgId, treatmentId, user.id, dto);
  }

  @Post(':treatmentId/restore')
  @UseGuards(RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async restore(
    @Param('orgId') orgId: string,
    @Param('treatmentId') treatmentId: string,
    @CurrentUser() user: Vet,
  ) {
    return this.treatmentsService.restore(orgId, treatmentId, user.id);
  }

  @Get(':treatmentId/versions')
  async getVersions(
    @Param('orgId') orgId: string,
    @Param('treatmentId') treatmentId: string,
  ) {
    return this.treatmentsService.getVersions(orgId, treatmentId);
  }

  @Post(':treatmentId/payment')
  async markPayment(
    @Param('orgId') orgId: string,
    @Param('treatmentId') treatmentId: string,
    @CurrentUser() user: Vet,
    @Body() dto: MarkPaymentDto,
  ) {
    return this.treatmentsService.markPayment(orgId, treatmentId, user.id, dto);
  }
}
