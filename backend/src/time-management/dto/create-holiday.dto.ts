import { IsNotEmpty, IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { HolidayType } from '../Models/enums';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(HolidayType)
  type: HolidayType;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
