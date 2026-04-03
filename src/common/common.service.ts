import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PORT, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {
  constructor() {}
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }
    return this.cursorPaginate(dto, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}:${PORT}/posts`);

    if (nextUrl) {
      const dtoRecord = dto as unknown as Record<string, unknown>;
      for (const key of Object.keys(dto)) {
        const value =
          key === 'where__id__more_than' || key === 'where__id__less_than'
            ? lastItem.id.toString()
            : dtoRecord[key];
        if (value) {
          nextUrl.searchParams.append(key, String(value));
        }
      }

      let key = null;

      if (dto.order__createdAt === 'asc') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(
        'where__id_more_than',
        lastItem.id.toString(),
      );
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [k, v] of Object.entries(dto)) {
      if (k.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter<T>(k, v),
        };
      } else if (k.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOrderFilter<T>(k, v),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? (dto.page - 1) * dto.take : undefined,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: string,
  ): FindOptionsWhere<T> {
    const options: FindOptionsWhere<T> = {};

    // 예를 들어 __기준으로 나누면 ['where', 'id', 'more_than'] 이런식으로 나뉨
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException('Invalid where filter format');
    }

    if (split.length === 2) {
      const [_, field] = split;
      options[field as keyof T] = value as any;
      return options;
    } else {
      const [_, field, operator] = split;

      if (operator === 'between') {
        const [from, to] = value.toString().split(',');
        options[field as keyof T] = FILTER_MAPPER.between(
          from as any,
          to as any,
        ) as any;
      } else if (operator === 'i_like') {
        options[field as keyof T] = FILTER_MAPPER.i_like(
          `%${value}%`,
        ) as any;
      } else {
        const mapperFn = FILTER_MAPPER[
          operator as keyof typeof FILTER_MAPPER
        ] as (val: any) => any;
        options[field as keyof T] = mapperFn(value) as any;
      }
    }

    return options;
  }

  private parseOrderFilter<T extends BaseModel>(
    _key: string,
    _value: string,
  ): FindOptionsOrder<T> {
    return {};
  }
}
