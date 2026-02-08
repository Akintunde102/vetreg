import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare const DELETE_PERMISSION_KEY = "deletePermission";
export type DeletePermissionType = 'canDeleteClients' | 'canDeleteAnimals' | 'canDeleteTreatments';
export declare class DeletePermissionGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
