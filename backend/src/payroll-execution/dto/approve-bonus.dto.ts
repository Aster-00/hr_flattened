import { IsEnum, IsMongoId } from 'class-validator';
import { BonusStatus } from '../enums/payroll-execution-enum';

export class ApproveBonusDto {
  @IsMongoId()
  bonusRecordId: string;

  @IsEnum(BonusStatus)
  status: BonusStatus;
}
