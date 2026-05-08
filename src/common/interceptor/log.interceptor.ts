import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  /**
   * 요청이 들어올때 REQ 요청 타임 스탬프찍음
   * {요청 path} {요청 method} {요청 시간}
   *
   * 응답이 나갈때 RES 요청 타임 스탬프찍음
   * {요청 path} {요청 method} {응답 시간} {응답까지 걸린 시간}
   *
   * 로그는 콘솔에 찍음
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();

    const req = context.switchToHttp().getRequest<Request>();
    const path = req.originalUrl;
    const method = req.method;

    console.log(`[REQ] ${method} ${path} ${new Date().toLocaleString('kr')}`);

    return next.handle().pipe(
      tap(() =>
        console.log(
          `[RES] ${method} ${path} ${new Date().toLocaleString('kr')} ${
            Date.now() - now
          } ms`,
        ),
      ),
      map((data: unknown) => ({ res: data, message: 'success' })),
    );
  }
}
