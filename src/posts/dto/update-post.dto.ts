import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString } from 'class-validator';
import { validationMessage } from 'src/common/validation-message/validation.message';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString({
    message: validationMessage.string,
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: validationMessage.string,
  })
  @IsOptional()
  content?: string;
}
