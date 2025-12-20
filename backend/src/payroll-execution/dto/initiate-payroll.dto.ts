import { IsDateString, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class InitiatePayrollDto {
    @IsDateString()
    @IsNotEmpty()
    period: Date;

    @IsMongoId()
    @IsNotEmpty()
    specialistId: string;

    @IsString()
    @IsNotEmpty()
    entity: string;
}
