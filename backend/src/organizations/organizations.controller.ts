import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { GetRevenueQueryDto } from './dto/get-revenue-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalGuard } from '../auth/guards/approval.guard';
import { OrgScopeGuard } from '../auth/guards/org-scope.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ActivityLogPermissionGuard } from '../auth/guards/activity-log-permission.guard';
import { MasterAdminGuard } from '../auth/guards/master-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkipApproval } from '../auth/decorators/skip-approval.decorator';
import { SkipResponseTransform } from '../common/decorators/skip-response-transform.decorator';
import { MembershipRole } from '@prisma/client';
import type { Vet } from '@prisma/client';

@ApiTags('Organizations')
@ApiBearerAuth('access-token')
@Controller('orgs')
@UseGuards(JwtAuthGuard, ApprovalGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(@CurrentUser() user: Vet, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: Vet) {
    return this.organizationsService.findAll(user.id);
  }

  @Get(':orgId')
  @UseGuards(OrgScopeGuard)
  async findOne(@Param('orgId') orgId: string, @CurrentUser() user: Vet) {
    return this.organizationsService.findOne(orgId, user.id);
  }

  @Patch(':orgId')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async update(
    @Param('orgId') orgId: string,
    @CurrentUser() user: Vet,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(orgId, user.id, dto);
  }

  @Get(':orgId/members')
  @UseGuards(OrgScopeGuard)
  async getMembers(@Param('orgId') orgId: string) {
    return this.organizationsService.getMembers(orgId);
  }

  @Get(':orgId/activity-log')
  @UseGuards(OrgScopeGuard, ActivityLogPermissionGuard)
  async getActivityLogs(
    @Param('orgId') orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.organizationsService.getActivityLogs(orgId, page, limit);
  }

  // Master Admin endpoints for organization approval
  @Get('admin/pending-approvals')
  @SkipApproval()
  @UseGuards(MasterAdminGuard)
  async getPendingApprovals() {
    return this.organizationsService.getPendingApprovals();
  }

  @Post('admin/:orgId/approve')
  @HttpCode(200)
  @SkipResponseTransform()
  @SkipApproval()
  @UseGuards(MasterAdminGuard)
  async approveOrganization(
    @Param('orgId') orgId: string,
    @CurrentUser() admin: Vet,
  ) {
    const org = await this.organizationsService.approveOrganization(admin.id, orgId);
    return { success: true, data: org };
  }

  @Post('admin/:orgId/reject')
  @HttpCode(200)
  @SkipResponseTransform()
  @SkipApproval()
  @UseGuards(MasterAdminGuard)
  async rejectOrganization(
    @Param('orgId') orgId: string,
    @CurrentUser() admin: Vet,
    @Body('reason') reason: string,
  ) {
    const org = await this.organizationsService.rejectOrganization(
      admin.id,
      orgId,
      reason,
    );
    return { success: true, data: org };
  }

  @Post('admin/:orgId/suspend')
  @HttpCode(200)
  @SkipResponseTransform()
  @SkipApproval()
  @UseGuards(MasterAdminGuard)
  async suspendOrganization(
    @Param('orgId') orgId: string,
    @CurrentUser() admin: Vet,
    @Body('reason') reason: string,
  ) {
    const org = await this.organizationsService.suspendOrganization(
      admin.id,
      orgId,
      reason,
    );
    return { success: true, data: org };
  }

  @Post('admin/:orgId/reactivate')
  @HttpCode(200)
  @SkipResponseTransform()
  @SkipApproval()
  @UseGuards(MasterAdminGuard)
  async reactivateOrganization(
    @Param('orgId') orgId: string,
    @CurrentUser() admin: Vet,
  ) {
    const org = await this.organizationsService.reactivateOrganization(admin.id, orgId);
    return { success: true, data: org };
  }

  @Get(':orgId/revenue')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async getRevenue(
    @Param('orgId') orgId: string,
    @Query() query: GetRevenueQueryDto,
  ) {
    return this.organizationsService.getRevenue(orgId, query);
  }

  @Get(':orgId/dashboard/stats')
  @SkipResponseTransform()
  @UseGuards(OrgScopeGuard)
  async getDashboardStats(@Param('orgId') orgId: string) {
    return this.organizationsService.getDashboardStats(orgId);
  }
}
