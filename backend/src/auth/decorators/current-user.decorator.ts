import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Vet } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Vet => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
