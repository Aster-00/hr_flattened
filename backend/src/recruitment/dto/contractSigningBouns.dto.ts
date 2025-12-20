import { IsNumber, IsString } from 'class-validator';
export class contractSigningBonusDto {

    @IsNumber()
    signingBonus: number;

    @IsString()
    role: string;

}
