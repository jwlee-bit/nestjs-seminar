import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 마지막 데이터 ID
  //  이 프로퍼티에 입력된 id보다 높은 ID부터 가져오기
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // created_at 기준으로 정렬
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order__createdAt: 'asc' | 'desc' = 'asc';

  // 몇개 행 받을지
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take: number = 20;
}
