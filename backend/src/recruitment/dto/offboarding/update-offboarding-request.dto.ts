import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';
import { TerminationStatus } from '../../enums/termination-status.enum.js';
import { Type } from 'class-transformer';

export class UpdateOffboardingRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  employeeComments?: string;

  @IsOptional()
  @IsString()
  hrComments?: string;

  @IsOptional()
  @IsEnum(TerminationStatus)
  status?: TerminationStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  actualExitDate?: Date;

  @IsOptional()
  exitInterviewCompleted?: boolean;

  @IsOptional()
  assetsReturned?: boolean;

  @IsOptional()
  settlementCompleted?: boolean;

  @IsOptional()
  clearanceCompleted?: boolean;
}
