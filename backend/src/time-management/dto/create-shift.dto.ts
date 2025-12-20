import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { PunchPolicy } from '../Models/enums/index';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  shiftType: string; // ObjectId as string

  @IsNotEmpty()
  @IsString()
  startTime: string; // 'HH:mm'

  @IsNotEmpty()
  @IsString()
  endTime: string; // 'HH:mm'

  @IsOptional()
  @IsEnum(PunchPolicy)
  punchPolicy?: PunchPolicy;

  @IsOptional()
  @IsNumber()
  @Min(0)
  graceInMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  graceOutMinutes?: number;

  @IsOptional()
  @IsOptional()
  requiresApprovalForOvertime?: boolean;
}
