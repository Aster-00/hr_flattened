import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @IsNotEmpty()
  @IsEnum(OnboardingTaskStatus)
  status: OnboardingTaskStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
