import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateShiftAssignmentDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
