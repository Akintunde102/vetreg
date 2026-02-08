import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Injectable()
export class MasterAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'User not authenticated',
      });
    }

    if (!user.isMasterAdmin) {
      throw new ForbiddenException({
        code: 'MASTER_ADMIN_REQUIRED',
        message: 'This action requires Master Admin privileges',
      });
    }

    return true;
  }
}
