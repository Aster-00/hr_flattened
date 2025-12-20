// src/leaves/requests/dto/update-request.dto.ts
import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRequestDto {
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsNumber()
  @Min(0.5)
  @IsOptional()
  durationDays?: number;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsMongoId()
  @IsOptional()
  attachmentId?: string;
}
