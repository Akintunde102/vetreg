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
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { DeleteTreatmentDto } from './dto/delete-treatment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalGuard } from '../auth/guards/approval.guard';
import { OrgScopeGuard } from '../auth/guards/org-scope.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { DeletePermissionGuard } from '../auth/guards/delete-permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireDeletePermission } from '../auth/decorators/delete-permission.decorator';
import { MembershipRole } from '@prisma/client';
import type { Vet } from '@prisma/client';

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
      includeDeleted,
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
}
