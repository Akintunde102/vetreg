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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { RecordDeathDto } from './dto/record-death.dto';
import { DeleteAnimalDto } from './dto/delete-animal.dto';
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

@ApiTags('Animals')
@ApiBearerAuth('access-token')
@Controller('orgs/:orgId/animals')
@UseGuards(JwtAuthGuard, ApprovalGuard, OrgScopeGuard)
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @CurrentUser() user: Vet,
    @Body() dto: CreateAnimalDto,
  ) {
    return this.animalsService.create(orgId, user.id, dto);
  }

  @Get()
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('species') species?: string,
    @Query('clientId') clientId?: string,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    includeDeleted?: boolean,
  ) {
    return this.animalsService.findAll(
      orgId,
      page,
      limit,
      search,
      species,
      clientId,
      includeDeleted,
    );
  }

  @Get(':animalId')
  async findOne(
    @Param('orgId') orgId: string,
    @Param('animalId') animalId: string,
  ) {
    return this.animalsService.findOne(orgId, animalId);
  }

  @Patch(':animalId')
  async update(
    @Param('orgId') orgId: string,
    @Param('animalId') animalId: string,
    @CurrentUser() user: Vet,
    @Body() dto: UpdateAnimalDto,
  ) {
    return this.animalsService.update(orgId, animalId, user.id, dto);
  }

  @Delete(':animalId')
  @UseGuards(RoleGuard, DeletePermissionGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER)
  @RequireDeletePermission('canDeleteAnimals')
  async softDelete(
    @Param('orgId') orgId: string,
    @Param('animalId') animalId: string,
    @CurrentUser() user: Vet,
    @Body() dto: DeleteAnimalDto,
  ) {
    return this.animalsService.softDelete(orgId, animalId, user.id, dto);
  }

  @Post(':animalId/restore')
  @UseGuards(RoleGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  async restore(
    @Param('orgId') orgId: string,
    @Param('animalId') animalId: string,
    @CurrentUser() user: Vet,
  ) {
    return this.animalsService.restore(orgId, animalId, user.id);
  }

  @Patch(':animalId/death')
  async recordDeath(
    @Param('orgId') orgId: string,
    @Param('animalId') animalId: string,
    @CurrentUser() user: Vet,
    @Body() dto: RecordDeathDto,
  ) {
    return this.animalsService.recordDeath(orgId, animalId, user.id, dto);
  }

  @Get(':animalId/treatments')
  async getTreatmentHistory(
    @Param('orgId') orgId: string,
    @Param('animalId') animalId: string,
  ) {
    return this.animalsService.getTreatmentHistory(orgId, animalId);
  }
}
