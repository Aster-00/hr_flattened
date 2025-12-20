// src/leaves/requests/dto/create-request.dto.ts
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateRequestDto {
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @IsNumber()
  @Min(0.5)
  durationDays: number;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsMongoId()
  @IsOptional()
  attachmentId?: string;

  // Optional: mark as post-leave request (REQ-031)
  @IsOptional()
  isPostLeave?: boolean;
}
