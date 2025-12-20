import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateScheduleRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  pattern: string; // free-form pattern like 'Mon-Fri' or '4-3-0'

  @IsOptional()
  @IsString()
  description?: string;
}
