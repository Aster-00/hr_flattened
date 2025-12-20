// src/leaves/requests/dto/finalize-request.dto.ts
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class FinalizeRequestDto {
  @IsMongoId()
  hrUserId: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
