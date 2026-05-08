import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, map, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TrInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const qr = this.dataSource.createQueryRunner();

    // 쿼리러너에 연결
    await qr.connect();
    // 쿼리 러너에서 트랜잭션 실행
    // 이 시점부터 같은 쿼리 러너 사용시 트랜잭션 안에서 액션
    await qr.startTransaction();

    req.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (e: unknown) => {
        await qr.rollbackTransaction();
        await qr.release();

        throw new InternalServerErrorException(e);
      }),
      // res끝난뒤 무언가를 하고싶을때
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
