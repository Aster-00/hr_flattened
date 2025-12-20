import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateReferralDto {
    @IsNotEmpty()
    @IsMongoId()
    referringEmployeeId: string;

    @IsNotEmpty()
    @IsString()
    role: string;

    @IsNotEmpty()
    @IsString()
    level: string;
}
