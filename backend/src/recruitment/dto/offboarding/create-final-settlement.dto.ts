import { IsNotEmpty, IsOptional, IsString, IsDate, IsNumber, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFinalSettlementDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastWorkingDay?: Date;

  @IsOptional()
  @IsNumber()
  finalSalaryAmount?: number;

  @IsOptional()
  @IsNumber()
  outstandingLeaveBalance?: number;

  @IsOptional()
  @IsNumber()
  leaveEncashmentAmount?: number;

  @IsOptional()
  @IsNumber()
  bonusAmount?: number;

  @IsOptional()
  @IsNumber()
  otherPayments?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @IsString()
  bankAccountDetails?: string;

  @IsOptional()
  @IsString()
  processingNotes?: string;
}

export class ProcessSettlementDto {
  @IsNotEmpty()
  @IsNumber()
  netSettlementAmount: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  processingNotes?: string;
}
