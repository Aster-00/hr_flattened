import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AppraisalTemplateType,
  AppraisalRatingScaleType,
} from '../enums/performance.enums';

export class RatingScaleDefinitionDto {
  @IsEnum(AppraisalRatingScaleType)
  type: AppraisalRatingScaleType;

  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  step?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}

export class EvaluationCriterionDto {
  @IsString()
  key: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class CreateAppraisalTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AppraisalTemplateType)
  templateType: AppraisalTemplateType;

  @ValidateNested()
  @Type(() => RatingScaleDefinitionDto)
  ratingScale: RatingScaleDefinitionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriterionDto)
  criteria?: EvaluationCriterionDto[];

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableDepartmentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicablePositionIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

