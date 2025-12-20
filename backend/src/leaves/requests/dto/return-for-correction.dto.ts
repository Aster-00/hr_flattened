// src/leaves/requests/dto/return-for-correction.dto.ts
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReturnForCorrectionDto {
  @IsMongoId()
  @IsNotEmpty()
  returnerId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
