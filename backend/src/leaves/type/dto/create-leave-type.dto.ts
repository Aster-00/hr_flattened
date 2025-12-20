import { IsString, IsBoolean, IsOptional, IsMongoId, IsEnum, IsNumber } from 'class-validator';
import { AttachmentType } from '../../enums/attachment-type.enum';

export class CreateLeaveTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  paid: boolean;

  @IsBoolean()
  deductible: boolean;

  @IsBoolean()
  requiresAttachment: boolean;

  @IsOptional()
  @IsEnum(AttachmentType)
  attachmentType?: AttachmentType;

  @IsOptional()
  @IsNumber()
  minTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  maxDurationDays?: number;
}
