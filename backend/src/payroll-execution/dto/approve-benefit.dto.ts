import { IsEnum, IsMongoId } from 'class-validator';
import { BenefitStatus } from '../enums/payroll-execution-enum';

export class ApproveBenefitDto {
  @IsMongoId()
  benefitRecordId: string;

  @IsEnum(BenefitStatus)
  status: BenefitStatus;
}
