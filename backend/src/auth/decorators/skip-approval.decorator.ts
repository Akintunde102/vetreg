import { SetMetadata } from '@nestjs/common';
import { SKIP_APPROVAL_KEY } from '../guards/approval.guard';

/**
 * Decorator to skip approval guard check
 * Use for endpoints that should be accessible to unapproved vets
 * (e.g., profile completion, checking approval status)
 */
export const SkipApproval = () => SetMetadata(SKIP_APPROVAL_KEY, true);
