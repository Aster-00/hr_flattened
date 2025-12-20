import { IsArray, IsDateString, IsOptional } from 'class-validator';

export class CreateCalendarDto {
  @IsOptional()
  @IsArray()
  @IsDateString(undefined, { each: true })
  publicHolidays?: string[];

  @IsOptional()
  @IsArray()
  @IsDateString(undefined, { each: true })
  blockedDays?: string[];
}
