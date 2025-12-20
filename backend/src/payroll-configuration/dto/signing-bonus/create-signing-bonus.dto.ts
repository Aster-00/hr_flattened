import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

export class CreateSigningBonusDto {
    @IsString()
    positionName: string;


    @IsOptional()
    @IsEnum(ConfigStatus)
    status?: ConfigStatus;

    @IsOptional()
    @IsString()
    createdBy?: string;
}
