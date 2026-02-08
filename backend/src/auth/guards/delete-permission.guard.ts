import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '@prisma/client';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

export const DELETE_PERMISSION_KEY = 'deletePermission';

export type DeletePermissionType =
  | 'canDeleteClients'
  | 'canDeleteAnimals'
  | 'canDeleteTreatments';

@Injectable()
export class DeletePermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission =
      this.reflector.getAllAndOverride<DeletePermissionType>(
        DELETE_PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const membership = request.orgMembership;

    if (!membership) {
      throw new ForbiddenException({
        code: 'NO_ORG_MEMBERSHIP',
        message: 'Organization membership required',
      });
    }

    // OWNER always has all permissions
    if (membership.role === MembershipRole.OWNER) {
      return true;
    }

    // Check specific permission
    const hasPermission = membership[requiredPermission] === true;

    if (!hasPermission) {
      throw new ForbiddenException({
        code: 'DELETE_PERMISSION_DENIED',
        message: `You do not have permission to perform this delete operation`,
        details: {
          requiredPermission,
        },
      });
    }

    return true;
  }
}
