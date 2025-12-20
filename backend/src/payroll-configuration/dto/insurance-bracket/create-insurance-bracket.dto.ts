import { IsNumber, IsOptional, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigStatus } from '../../enums/payroll-configuration-enums';

export class CreateInsuranceBracketDto {
    @IsString()
    name: string;



    @Type(() => Number)
    @IsNumber()
    minSalary: number;

    @Type(() => Number)
    @IsNumber()
    maxSalary: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    employeeRate: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    employerRate: number;

    @IsOptional()
    @IsEnum(ConfigStatus)
    status?: ConfigStatus;

    @IsOptional()
    @IsString()
    createdBy?: string;
}
