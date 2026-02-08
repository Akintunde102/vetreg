import { SetMetadata } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { ROLES_KEY } from '../guards/role.guard';

export const Roles = (...roles: MembershipRole[]) =>
  SetMetadata(ROLES_KEY, roles);
