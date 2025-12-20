import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
} from 'class-validator';
import {
  PolicyType,
  Applicability,
  ConfigStatus,
} from '../../enums/payroll-configuration-enums';

@ValidatorConstraint({ name: 'atLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(ruleDefinition: RuleDefinitionDto, args: ValidationArguments) {
    if (!ruleDefinition) return false;

    const hasPercentage = ruleDefinition.percentage !== undefined && ruleDefinition.percentage !== null;
    const hasFixedAmount = ruleDefinition.fixedAmount !== undefined && ruleDefinition.fixedAmount !== null;
    const hasThreshold = ruleDefinition.threshold !== undefined && ruleDefinition.threshold !== null;

    return hasPercentage || hasFixedAmount || hasThreshold;
  }

  defaultMessage(args: ValidationArguments) {
    return 'ruleDefinition must include at least one value (percentage, fixedAmount, or threshold)';
  }
}

export class RuleDefinitionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  threshold?: number;
}

export class CreatePayrollPolicyDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  policyName: string;

  @IsEnum(PolicyType)
  @IsNotEmpty()
  policyType: PolicyType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;

  @ValidateNested()
  @Type(() => RuleDefinitionDto)
  @IsNotEmpty()
  @Validate(AtLeastOneFieldConstraint)
  ruleDefinition: RuleDefinitionDto;

  @IsEnum(Applicability)
  @IsNotEmpty()
  applicability: Applicability;

  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;
}
