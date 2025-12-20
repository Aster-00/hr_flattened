import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class ApproveConfigDto {
  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}

export class RejectConfigDto {
  @IsString()
  @IsNotEmpty()
  rejectedBy: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ApprovalDto {
  @IsEnum(ConfigStatus)
  @IsNotEmpty()
  status: ConfigStatus;

  @IsOptional()
  @IsString()
  approverId?: string;
}


// FILE 4: Placeholder - Waiting for content
