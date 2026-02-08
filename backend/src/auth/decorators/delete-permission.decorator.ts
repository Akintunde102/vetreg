import { SetMetadata } from '@nestjs/common';
import {
  DELETE_PERMISSION_KEY,
  DeletePermissionType,
} from '../guards/delete-permission.guard';

export const RequireDeletePermission = (permission: DeletePermissionType) =>
  SetMetadata(DELETE_PERMISSION_KEY, permission);
