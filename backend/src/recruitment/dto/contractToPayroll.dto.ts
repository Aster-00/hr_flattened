import {IsDate, IsMongoId, IsNotIn, IsNumber, IsOptional, IsString} from 'class-validator';

export class contractToPayrolldto {
    @IsMongoId()
    contractId: string;

    @IsDate()
    acceptanceDate: Date;

    @IsOptional()
    @IsNumber()
    signingBonus?: number;

    @IsNumber()
    grossSalary: number;

    @IsString()
    role: string;

}
