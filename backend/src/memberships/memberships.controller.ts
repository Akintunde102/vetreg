import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalGuard } from '../auth/guards/approval.guard';
import { OrgScopeGuard } from '../auth/guards/org-scope.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';
import type { Vet } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, ApprovalGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Organization-scoped invitation management
  @Post('orgs/:orgId/invitations')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async createInvitation(
    @Param('orgId') orgId: string,
    @CurrentUser() user: Vet,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.membershipsService.createInvitation(orgId, user.id, dto);
  }

  @Get('orgs/:orgId/invitations')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async getInvitations(@Param('orgId') orgId: string) {
    return this.membershipsService.getInvitations(orgId);
  }

  @Delete('orgs/:orgId/invitations/:invitationId')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async cancelInvitation(
    @Param('orgId') orgId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: Vet,
  ) {
    return this.membershipsService.cancelInvitation(
      orgId,
      invitationId,
      user.id,
    );
  }

  // Global invitation response endpoints (no org scope needed)
  @Post('invitations/:token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @CurrentUser() user: Vet,
  ) {
    return this.membershipsService.acceptInvitation(token, user.id);
  }

  @Post('invitations/:token/decline')
  async declineInvitation(
    @Param('token') token: string,
    @CurrentUser() user: Vet,
  ) {
    return this.membershipsService.declineInvitation(token, user.id);
  }

  // Member management
  @Delete('orgs/:orgId/members/:membershipId')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER)
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @CurrentUser() user: Vet,
  ) {
    return this.membershipsService.removeMember(orgId, membershipId, user.id);
  }

  @Patch('orgs/:orgId/members/:membershipId/role')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER)
  async updateMemberRole(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @CurrentUser() user: Vet,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.membershipsService.updateMemberRole(
      orgId,
      membershipId,
      user.id,
      dto,
    );
  }

  @Patch('orgs/:orgId/members/:membershipId/permissions')
  @UseGuards(OrgScopeGuard, RoleGuard)
  @Roles(MembershipRole.OWNER)
  async updatePermissions(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @CurrentUser() user: Vet,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.membershipsService.updatePermissions(
      orgId,
      membershipId,
      user.id,
      dto,
    );
  }

  @Post('orgs/:orgId/leave')
  @UseGuards(OrgScopeGuard)
  async leaveMembership(
    @Param('orgId') orgId: string,
    @CurrentUser() user: Vet,
  ) {
    return this.membershipsService.leaveMembership(orgId, user.id);
  }
}
