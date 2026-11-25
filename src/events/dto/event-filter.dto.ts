import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class EventFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page?: number = 1;

@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
limit?: number = 10;
}