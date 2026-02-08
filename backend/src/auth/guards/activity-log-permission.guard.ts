import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Injectable()
export class ActivityLogPermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const membership = request.orgMembership;

    if (!membership) {
      throw new ForbiddenException({
        code: 'NO_ORG_MEMBERSHIP',
        message: 'Organization membership required',
      });
    }

    // OWNER always has access, or explicit permission granted
    const hasAccess =
      membership.role === MembershipRole.OWNER ||
      membership.canViewActivityLog === true;

    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'ACTIVITY_LOG_ACCESS_DENIED',
        message:
          'You do not have permission to view the organization activity log',
      });
    }

    return true;
  }
}
