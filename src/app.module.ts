import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

// zod를 사용한 환경변수 검증 예시 (적용 시 주석 해제 후 사용)
// import { z } from 'zod';
import { CommonModule } from './common/common.module';
import { ServeStaticModule } from '@nestjs/serve-static';
//
// const envSchema = z.object({
//   JWT_SECRET_KEY: z.string().min(1),
//   HASH_ROUNDS: z.coerce.number().int().positive(),
// });
//
// ConfigModule.forRoot({
//   isGlobal: true,
//   validate: (config) => {
//     const result = envSchema.safeParse(config);
//     if (!result.success) {
//       throw new Error(`환경변수 검증 실패: ${result.error.message}`);
//     }
//     return result.data;
//   },
// });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'password',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    ServeStaticModule.forRoot({
      rootPath: 'uploads',
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true, // @Type(() => Number) 없이도 자동 변환
        },
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
