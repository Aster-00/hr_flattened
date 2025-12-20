import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ApplicationStage } from '../enums/application-stage.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStage)
  @IsOptional()
  currentStage?: ApplicationStage;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsMongoId()
  @IsOptional()
  rejectedBy?: Types.ObjectId;

  @IsString()
  @IsOptional()
  notes?: string;
}
