import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOnboardingDto {
  @IsNotEmpty()
  employeeId: Types.ObjectId;

  @IsNotEmpty()
  @IsOptional()
  contractId?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  customTasks?: {
    name: string;
    department: string;
    deadline: Date;
    notes?: string;
  }[];
}
