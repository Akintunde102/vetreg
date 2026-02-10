import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Injectable()
export class MasterAdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    const masterAdminEmails: string[] =
      this.configService.get<string[]>('masterAdminEmails') ?? [];
    const emailInList =
      user.email &&
      masterAdminEmails.includes(user.email.trim().toLowerCase());

    if (!user.isMasterAdmin && !emailInList) {
      throw new ForbiddenException({
        code: 'MASTER_ADMIN_REQUIRED',
        message: 'This action requires Master Admin privileges',
      });
    }

    return true;
  }
}
