import { IsString, IsNotEmpty } from 'class-validator';

export class InitiatePeriodDto {
  @IsString()
  @IsNotEmpty()
  payrollPeriod: string; // e.g. "2024-01" or "2025-02-28"

  @IsString()
  @IsNotEmpty()
  entity: string;

  @IsString()
  @IsNotEmpty()
  payrollSpecialistId: string;

  @IsString()
  @IsNotEmpty()
  payrollManagerId: string;
}