import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { GetLocationsSortBy } from './get-location-sort-by.enum';
import { SortType } from './sort-type.enum';

export class GetLocationsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(10)
  @Max(50)
  size: number = 10;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsOptional()
  @IsEnum(GetLocationsSortBy)
  sortBy: GetLocationsSortBy = GetLocationsSortBy.ID;

  @IsOptional()
  @IsEnum(SortType)
  sortType: SortType = SortType.ASC;
}
