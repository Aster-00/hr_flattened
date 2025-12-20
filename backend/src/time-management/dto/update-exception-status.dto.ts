import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export enum TimeExceptionStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED', // ✅ added
}

export class UpdateExceptionStatusDto {
  @IsNotEmpty()
  @IsEnum(TimeExceptionStatus)
  status: TimeExceptionStatus;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
