import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
  ValidateNested,
  IsObject,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccrualMethod } from '../../enums/accrual-method.enum';
import { RoundingRule } from '../../enums/rounding-rule.enum';

class ApprovalStepDto {
  @IsString()
  role: string;

  @IsNumber()
  level: number;
}

class EligibilityDto {
  @IsOptional()
  @IsNumber()
  minTenureMonths?: number;

  @IsOptional()
  @IsArray()
  positionsAllowed?: string[];

  @IsOptional()
  @IsArray()
  contractTypesAllowed?: string[];
}

export class CreateLeavePolicyDto {
  @IsMongoId()
  leaveTypeId: string;

  @IsEnum(AccrualMethod)
  accrualMethod: AccrualMethod;

  @IsOptional()
  @IsNumber()
  monthlyRate?: number;

  @IsOptional()
  @IsNumber()
  yearlyRate?: number;

  @IsBoolean()
  carryForwardAllowed: boolean;

  @IsOptional()
  @IsNumber()
  maxCarryForward?: number;

  @IsOptional()
  @IsNumber()
  expiryAfterMonths?: number;

  @IsEnum(RoundingRule)
  roundingRule: RoundingRule;

  @IsNumber()
  minNoticeDays: number;

  @IsOptional()
  @IsNumber()
  maxConsecutiveDays?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EligibilityDto)
  eligibility?: EligibilityDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  approvalChain: ApprovalStepDto[];
}
