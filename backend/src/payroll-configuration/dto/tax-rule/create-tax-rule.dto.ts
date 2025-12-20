import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

export class CreateTaxRuleDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    rate: number;

    @IsOptional()
    @IsEnum(ConfigStatus)
    status?: ConfigStatus;

    @IsOptional()
    @IsString()
    createdBy?: string;
}
