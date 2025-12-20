import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

export class CreateAllowanceDto {
    @IsString()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsString()
    createdBy?: string;

    @IsOptional()
    @IsEnum(ConfigStatus)
    status?: ConfigStatus;
}
