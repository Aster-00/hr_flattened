import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RejectPayrollDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}
