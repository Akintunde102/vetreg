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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { DeleteClientDto } from './dto/delete-client.dto';
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

@Controller('orgs/:orgId/clients')
@UseGuards(JwtAuthGuard, ApprovalGuard, OrgScopeGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @CurrentUser() user: Vet,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.create(orgId, user.id, dto);
  }

  @Get()
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query(
      'includeDeleted',
      new DefaultValuePipe(false),
      ParseBoolPipe,
    )
    includeDeleted?: boolean,
  ) {
    return this.clientsService.findAll(
      orgId,
      page,
      limit,
      search,
      includeDeleted,
    );
  }

  @Get(':clientId')
  async findOne(
    @Param('orgId') orgId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.clientsService.findOne(orgId, clientId);
  }

  @Patch(':clientId')
  async update(
    @Param('orgId') orgId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: Vet,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(orgId, clientId, user.id, dto);
  }

  @Delete(':clientId')
  @UseGuards(RoleGuard, DeletePermissionGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  @RequireDeletePermission('canDeleteClients')
  async softDelete(
    @Param('orgId') orgId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: Vet,
    @Body() dto: DeleteClientDto,
  ) {
    return this.clientsService.softDelete(orgId, clientId, user.id, dto);
  }

  @Post(':clientId/restore')
  @UseGuards(RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async restore(
    @Param('orgId') orgId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: Vet,
  ) {
    return this.clientsService.restore(orgId, clientId, user.id);
  }

  @Get(':clientId/animals')
  async getClientAnimals(
    @Param('orgId') orgId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.clientsService.getClientAnimals(orgId, clientId);
  }
}
