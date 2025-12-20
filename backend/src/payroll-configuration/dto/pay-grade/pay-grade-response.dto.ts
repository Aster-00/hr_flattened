import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';
import {
  CreatePayGradeDto,
  GrossSalaryGteBaseSalaryConstraint,
} from './create-pay-grade.dto';

export class PayGradeResponseDto implements CreatePayGradeDto {
  @IsString()
  _id: string;

  @IsString()
  grade: string;

  @Type(() => Number)
  @IsNumber()
  @Min(6000)
  baseSalary: number;

  @Type(() => Number)
  @IsNumber()
  @Min(6000)
  @Validate(GrossSalaryGteBaseSalaryConstraint)
  grossSalary: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsEnum(ConfigStatus)
  status: ConfigStatus;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  approvedAt?: string;
}


// FILE 11: Placeholder - Waiting for content
