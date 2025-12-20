import { IsString, IsNotEmpty, IsArray, IsBoolean, IsOptional, ValidateNested, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStage } from '../enums/application-stage.enum';

export class ProcessStageDto {
  @IsEnum(ApplicationStage)
  @IsNotEmpty()
  stage: ApplicationStage;

  @IsString()
  @IsNotEmpty()
  stageName: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  order: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  weight: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class CreateHiringProcessTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessStageDto)
  stages: ProcessStageDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableRoles?: string[];

  @IsBoolean()
  @IsOptional()
  defaultTemplate?: boolean;
}
