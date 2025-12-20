import { IsNotEmpty, IsString } from 'class-validator';

export class CorrectionRequestDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  attendanceRecordId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
