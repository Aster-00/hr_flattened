import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsEnum,
} from 'class-validator';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

@ValidatorConstraint({ name: 'GrossSalaryGteBaseSalary', async: false })
export class GrossSalaryGteBaseSalaryConstraint
  implements ValidatorConstraintInterface {
  validate(grossSalary: number, args: ValidationArguments): boolean {
    const { baseSalary } = args.object as CreatePayGradeDto;
    if (grossSalary === undefined || grossSalary === null) {
      return true;
    }
    if (baseSalary === undefined || baseSalary === null) {
      return true;
    }
    return grossSalary >= baseSalary;
  }

  defaultMessage(): string {
    return 'grossSalary must be greater than or equal to baseSalary';
  }
}

export class CreatePayGradeDto {
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

  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;
}
