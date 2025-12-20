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

export class UpdateRatingScaleDefinitionDto {
  @IsOptional()
  @IsEnum(AppraisalRatingScaleType)
  type?: AppraisalRatingScaleType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  step?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}

export class UpdateEvaluationCriterionDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  title?: string;

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

export class UpdateAppraisalTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AppraisalTemplateType)
  templateType?: AppraisalTemplateType;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRatingScaleDefinitionDto)
  ratingScale?: UpdateRatingScaleDefinitionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEvaluationCriterionDto)
  criteria?: UpdateEvaluationCriterionDto[];

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

