import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModel } from 'src/users/entities/users.entity';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { ImagesModel } from 'src/common/entity/images.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImagesModel]),
    CommonModule,
    AuthModule,
    UsersModel,
    MulterModule.register({
      limits: {
        // 바이트 단위
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      storage: multer.diskStorage({
        destination: './uploads',
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
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
