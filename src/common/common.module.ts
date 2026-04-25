import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits: {
        // 바이트 단위
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      storage: multer.diskStorage({
        destination: '/temp',
        filename: (req, file, callback) => {
          callback(null, `${uuid()}-${file.originalname}`); // 고유한 파일 이름 생성
        },
      }),
      fileFilter: (req, file, callback) => {
        // cb(error, boolean: true - 파일 다운 허용, false - 거부)
        if (file.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
      },
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
