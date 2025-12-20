import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class CreateOvertimeRuleDto {
  @IsString()
  name: string;

  @IsNumber()
  overtimeRate: number; // BR-TM-08

  @IsNumber()
  weekendRate: number;

  @IsNumber()
  holidayRate: number;

  @IsBoolean()
  requiresApproval: boolean;

  @IsNumber()
  minHoursBeforeApproval: number;

  @IsBoolean()
  shortTimeAllowed: boolean;

  @IsNumber()
  shortTimeLimitHours: number;
}
