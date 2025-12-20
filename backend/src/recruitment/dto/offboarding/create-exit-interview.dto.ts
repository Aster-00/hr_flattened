import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsMongoId } from 'class-validator';

export class CreateExitInterviewDto {
  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsNumber()
  overallRating?: number;

  @IsOptional()
  @IsNumber()
  departmentSatisfaction?: number;

  @IsOptional()
  @IsNumber()
  managementFeedback?: number;

  @IsOptional()
  @IsNumber()
  workEnvironmentRating?: number;

  @IsOptional()
  @IsNumber()
  compensationSatisfaction?: number;

  @IsOptional()
  @IsString()
  reasonsForLeaving?: string;

  @IsOptional()
  @IsString()
  suggestionsForImprovement?: string;

  @IsOptional()
  @IsMongoId()
  interviewerName?: string;

  @IsOptional()
  @IsBoolean()
  recommendToOthers?: boolean;
}
