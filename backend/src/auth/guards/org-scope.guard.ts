import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class OrgScopeGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    // Extract organizationId from params or body
    const organizationId =
      request.params?.orgId ||
      request.params?.organizationId ||
      request.body?.organizationId;

    if (!organizationId) {
      throw new BadRequestException({
        code: 'ORG_ID_REQUIRED',
        message: 'Organization ID is required',
      });
    }

    // Check membership
    const membership = await this.prisma.orgMembership.findUnique({
      where: {
        vetId_organizationId: {
          vetId: user.id,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException({
        code: 'NOT_ORG_MEMBER',
        message: 'You are not a member of this organization',
      });
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException({
        code: 'MEMBERSHIP_NOT_ACTIVE',
        message: 'Your membership in this organization is not active',
        details: { status: membership.status },
      });
    }

    // Attach membership and organizationId to request for downstream use
    request.orgMembership = membership;
    request.organizationId = organizationId;

    return true;
  }
}
