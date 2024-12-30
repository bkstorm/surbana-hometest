import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(1, 255)
  code: string;

  @IsNumber()
  @IsPositive()
  area: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  parentId?: number;
}
