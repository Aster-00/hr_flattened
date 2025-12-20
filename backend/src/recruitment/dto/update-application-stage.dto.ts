import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';

export class UpdateApplicationStageDto {
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @IsString()
  @IsOptional()
  notes?: string;
}
