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

export class CycleTemplateAssignmentDto {
  @IsString()
  templateId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];
}

export class CreateAppraisalCycleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AppraisalTemplateType)
  cycleType: AppraisalTemplateType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  managerDueDate?: string;

  @IsOptional()
  @IsDateString()
  employeeAcknowledgementDueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CycleTemplateAssignmentDto)
  templateAssignments?: CycleTemplateAssignmentDto[];
}

