import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RatingEntryDto {
  // Accept both formats: new format (criterionKey/score) or old format (key/ratingValue)
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  criterionKey?: string; // User-friendly format

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ratingValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number; // User-friendly format

  @IsOptional()
  @IsString()
  ratingLabel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightedScore?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  comment?: string; // User-friendly format
}

export class CreateAppraisalRecordDto {
  @IsOptional()
  @IsString()
  assignmentId?: string; // Optional since it comes from URL param

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingEntryDto)
  ratings: RatingEntryDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalScore?: number;

  @IsOptional()
  @IsString()
  overallRatingLabel?: string;

  @IsOptional()
  @IsString()
  managerSummary?: string;

  @IsOptional()
  @IsString()
  overallComment?: string; // Alias for managerSummary

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvementAreas?: string;

  @IsOptional()
  developmentPlan?: any; // Store development plan if needed
}

export class UpdateAppraisalRecordDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingEntryDto)
  ratings?: RatingEntryDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalScore?: number;

  @IsOptional()
  @IsString()
  overallRatingLabel?: string;

  @IsOptional()
  @IsString()
  managerSummary?: string;

  @IsOptional()
  @IsString()
  overallComment?: string; // Alias for managerSummary

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvementAreas?: string;

  @IsOptional()
  developmentPlan?: any; // Store development plan if needed
}

