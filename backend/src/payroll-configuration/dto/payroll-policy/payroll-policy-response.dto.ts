import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import {
  ConfigStatus,
  PolicyType,
  Applicability,
} from '../../enums/payroll-configuration-enums';
import { RuleDefinitionDto } from './create-payroll-policy.dto';

export class PayrollPolicyResponseDto {
  @IsString()
  _id: string;

  @IsString()
  policyName: string;

  @IsEnum(PolicyType)
  policyType: PolicyType;

  @IsString()
  description: string;

  @IsDateString()
  effectiveDate: string;

  @ValidateNested()
  @Type(() => RuleDefinitionDto)
  ruleDefinition: RuleDefinitionDto;

  @IsEnum(Applicability)
  applicability: Applicability;

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
  @IsDateString()
  approvedAt?: string;

  @IsOptional()
  @IsString()
  rejectedBy?: string;

  @IsOptional()
  @IsDateString()
  rejectedAt?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
