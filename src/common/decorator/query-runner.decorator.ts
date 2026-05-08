import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      throw new Error(
        'QueryRunner not found in request. Make sure to use TrInterceptor.',
      );
    }

    return req.queryRunner;
  },
);
