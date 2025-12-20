import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

export class CompanyWideSettingsDto {
    @IsDateString()
    payDate: string | Date;

    @IsString()
    timeZone: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsEnum(ConfigStatus)
    status?: ConfigStatus;
}
