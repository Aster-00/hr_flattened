import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateLatenessRuleDto {
  @IsString()
  name: string;

  @IsNumber()
  gracePeriodMinutes: number; // BR-TM-09

  @IsNumber()
  latenessThresholdMinutes: number; // BR-TM-09

  @IsString()
  penaltyType: 'none' | 'warning' | 'deduction' | 'escalation';

  @IsOptional()
  @IsNumber()
  penaltyValue?: number;

  @IsNumber()
  repeatLatenessLimit: number; // BR-TM-12

  @IsString()
  repeatAction: 'notify' | 'manager-review' | 'hr-escalation';
}
