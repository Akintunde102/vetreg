import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '@prisma/client';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

export const ROLES_KEY = 'roles';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const membership = request.orgMembership;

    if (!membership) {
      throw new ForbiddenException({
        code: 'NO_ORG_MEMBERSHIP',
        message: 'You are not a member of this organization',
      });
    }

    const hasRole = requiredRoles.includes(membership.role);

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_ROLE',
        message: `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
        details: {
          requiredRoles,
          userRole: membership.role,
        },
      });
    }

    return true;
  }
}
