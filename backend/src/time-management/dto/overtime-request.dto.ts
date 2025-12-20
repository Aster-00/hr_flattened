import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class OvertimeRequestDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  attendanceRecordId: string;

  @IsNotEmpty()
  @IsDateString()
  requestedUntil: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
