import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MaritalStatus } from '../enums/employee-profile.enums';

export class CreateLegalChangeRequestDto {
    @IsOptional()
    @IsString()
    newLegalFirstName?: string;

    @IsOptional()
    @IsString()
    newLegalLastName?: string;

    @IsOptional()
    @IsEnum(MaritalStatus)
    newMaritalStatus?: MaritalStatus;

    @IsString()
    reason: string;
}
