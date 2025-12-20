import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

export class CreateTerminationBenefitDto {
    @IsString()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsString()
    terms?: string;

    @IsOptional()
    @IsEnum(ConfigStatus)
    status?: ConfigStatus;

    @IsOptional()
    @IsString()
    createdBy?: string;
}
