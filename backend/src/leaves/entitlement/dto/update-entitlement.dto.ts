import { IsOptional, IsNumber } from 'class-validator';

export class UpdateEntitlementDto {
  @IsOptional()
  @IsNumber()
  taken?: number;

  @IsOptional()
  @IsNumber()
  pending?: number;

  @IsOptional()
  @IsNumber()
  accruedActual?: number;

  @IsOptional()
  @IsNumber()
  accruedRounded?: number;

  @IsOptional()
  @IsNumber()
  carryForward?: number;
}
