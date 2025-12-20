// src/leaves/tracking/dto/history-filter.dto.ts
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class HistoryFilterDto {
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @IsMongoId()
  @IsOptional()
  managerId?: string;

  @IsMongoId()
  @IsOptional()
  leaveTypeId?: string;

  @IsString()
  @IsOptional()
  status?: string; // can be narrowed to LeaveStatus later

  @IsOptional()
  fromDate?: string;

  @IsOptional()
  toDate?: string;
}
