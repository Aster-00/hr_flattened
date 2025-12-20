// src/leaves/requests/dto/approve-request.dto.ts
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class ApproveRequestDto {
  @IsMongoId()
  @IsOptional()
  approverId?: string; // Optional - will be set by controller from JWT

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  comments?: string; // Support both comment and comments from frontend
}
