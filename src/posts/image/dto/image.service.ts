import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesModel } from 'src/common/entity/images.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImagesModel)
    private readonly imagesRepository: Repository<ImagesModel>,
  ) {}
}
