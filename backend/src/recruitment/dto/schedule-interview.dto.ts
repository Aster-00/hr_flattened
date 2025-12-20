import { IsMongoId, IsNotEmpty, IsDate, IsEnum, IsArray, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ApplicationStage } from '../enums/application-stage.enum';
import { InterviewMethod } from '../enums/interview-method.enum';

export class ScheduleInterviewDto {
  @IsMongoId()
  @IsNotEmpty()
  applicationId: Types.ObjectId;

  @IsEnum(ApplicationStage)
  @IsNotEmpty()
  stage: ApplicationStage;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  scheduledDate: Date;

  @IsEnum(InterviewMethod)
  @IsNotEmpty()
  method: InterviewMethod;

  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  panel: Types.ObjectId[];

  @IsString()
  @IsOptional()
  videoLink?: string;

  @IsString()
  @IsOptional()
  candidateFeedback?: string;
}
