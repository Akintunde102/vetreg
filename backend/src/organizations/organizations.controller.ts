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
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalGuard } from '../auth/guards/approval.guard';
import { OrgScopeGuard } from '../auth/guards/org-scope.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ActivityLogPermissionGuard } from '../auth/guards/activity-log-permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';
import type { Vet } from '@prisma/client';

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
}
