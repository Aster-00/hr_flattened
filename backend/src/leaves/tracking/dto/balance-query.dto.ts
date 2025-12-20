// src/leaves/tracking/dto/balance-query.dto.ts
import { IsMongoId, IsOptional } from 'class-validator';

export class BalanceQueryDto {
  @IsMongoId()
  @IsOptional()
  employeeId?: string; // if missing, take from auth later

  @IsOptional()
  asOfDate?: string; // ISO date string; optional for now
}
