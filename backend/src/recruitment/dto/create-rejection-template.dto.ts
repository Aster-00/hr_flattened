import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';

export class CreateRejectionTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum([
    'qualifications_mismatch',
    'experience_insufficient',
    'skills_gap',
    'position_filled',
    'interview_performance',
    'cultural_fit',
    'compensation_mismatch',
    'other'
  ])
  @IsNotEmpty()
  reasonCategory: string;

  @IsEnum(ApplicationStage)
  @IsOptional()
  applicableStage?: ApplicationStage;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availablePlaceholders?: string[];
}
