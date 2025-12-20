import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  appraisalId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class ResolveDisputeDto {
  @IsString()
  resolutionSummary: string;

  @IsOptional()
  @IsString()
  adjustedRatingLabel?: string;

  @IsOptional()
  @IsNumber()
  adjustedScore?: number;
}

