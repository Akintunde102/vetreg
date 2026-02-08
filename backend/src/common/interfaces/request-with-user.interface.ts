import { Request } from 'express';
import { Vet, OrgMembership } from '@prisma/client';

export interface RequestWithUser extends Request {
  user?: Vet;
  orgMembership?: OrgMembership;
  organizationId?: string;
  ipAddress?: string;
}
