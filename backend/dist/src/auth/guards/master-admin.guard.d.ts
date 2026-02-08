import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class MasterAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
