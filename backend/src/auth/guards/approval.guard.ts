import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { VetStatus } from '@prisma/client';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

export const SKIP_APPROVAL_KEY = 'skipApproval';

@Injectable()
export class ApprovalGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route skips approval check
    const skipApproval = this.reflector.getAllAndOverride<boolean>(
      SKIP_APPROVAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipApproval) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    // Master admins have full access regardless of vet status
    const masterAdminEmails: string[] =
      this.configService.get<string[]>('masterAdminEmails') ?? [];
    const emailInList =
      user.email &&
      masterAdminEmails.includes(user.email.trim().toLowerCase());
    if (user.isMasterAdmin || emailInList) {
      return true;
    }

    // Check vet approval status
    if (user.status === VetStatus.PENDING_APPROVAL) {
      throw new ForbiddenException({
        code: 'VET_NOT_APPROVED',
        message:
          'Your profile is pending approval. Please wait for administrator verification.',
        details: { profileSubmittedAt: user.profileSubmittedAt },
      });
    }

    if (user.status === VetStatus.REJECTED) {
      throw new ForbiddenException({
        code: 'VET_REJECTED',
        message: 'Your application has been rejected.',
        details: {
          rejectionReason: user.rejectionReason,
          rejectedAt: user.rejectedAt,
        },
      });
    }

    if (user.status === VetStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: 'VET_SUSPENDED',
        message: 'Your account has been suspended.',
        details: {
          suspensionReason: user.suspensionReason,
          suspendedAt: user.suspendedAt,
        },
      });
    }

    return true;
  }
}
