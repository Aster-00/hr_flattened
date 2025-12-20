import { IsMongoId, IsNotEmpty, IsArray, IsNumber, IsString, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CriteriaScoreDto {
  @IsMongoId()
  @IsNotEmpty()
  criteriaId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  criteriaName: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class SubmitAssessmentDto {
  @IsMongoId()
  @IsNotEmpty()
  interviewId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  applicationId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  interviewerId: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaScoreDto)
  criteriaScores: CriteriaScoreDto[];

  @IsNumber()
  @IsOptional()
  totalScore?: number;

  @IsNumber()
  @IsOptional()
  maxTotalScore?: number;

  @IsNumber()
  @IsOptional()
  percentageScore?: number;

  @IsString()
  @IsOptional()
  overallComments?: string;

  @IsEnum(['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend'])
  @IsOptional()
  recommendation?: string;
}
