import { IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

/**
 * DTO for creating a job requisition
 * Matches the JobRequisition schema structure
 */
export class CreateJobRequisitionDto {
  @IsString()
  @IsNotEmpty()
  requisitionId?: string;

  @IsMongoId()
  @IsNotEmpty()
  templateId?: Types.ObjectId;

  @IsNumber()
  @Min(1)
  openings: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsMongoId()
  @IsNotEmpty()
  hiringManagerId?: Types.ObjectId;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;
}
