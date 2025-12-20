// src/leaves/policy/dto/update-eligibility.dto.ts
import { IsOptional, IsInt, Min, IsArray, IsString } from 'class-validator';

export class UpdateEligibilityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  minTenureMonths?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  positionsAllowed?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contractTypesAllowed?: string[];
}
