import { PickType } from '@nestjs/mapped-types';
import { ImagesModel } from 'src/common/entity/images.entity';

export class CreatePostImageDto extends PickType(ImagesModel, [
  'type',
  'path',
  'post',
  'order',
]) {}
