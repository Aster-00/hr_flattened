import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppraisalTemplateType } from '../enums/performance.enums';

export class UpdateCycleTemplateAssignmentDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];
}

export class UpdateAppraisalCycleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AppraisalTemplateType)
  cycleType?: AppraisalTemplateType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  managerDueDate?: string;

  @IsOptional()
  @IsDateString()
  employeeAcknowledgementDueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCycleTemplateAssignmentDto)
  templateAssignments?: UpdateCycleTemplateAssignmentDto[];
}

