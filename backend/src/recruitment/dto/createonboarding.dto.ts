import {OnboardingDocument} from '../Models/onboarding.schema';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class createOnboardingDto {
    @IsMongoId()
    @IsNotEmpty()
    employeeId: string;

    @IsArray()
    @ValidateNested({ each: true })
    tasks: any['tasks'];

    @IsBoolean()
    @IsOptional()
    completed?: boolean;

    @IsOptional()
    completedAt?: Date;
  contractId: import("mongoose").Types.ObjectId;
}