import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateBlockedPeriodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  affectsLeaveCalculation?: boolean;
}
