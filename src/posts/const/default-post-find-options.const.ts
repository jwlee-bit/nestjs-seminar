import { FindManyOptions } from 'typeorm';

export const DEFAULT_POST_FIND_OPTIONS: Pick<FindManyOptions, 'relations'> = {
  relations: ['author', 'images'],
};
