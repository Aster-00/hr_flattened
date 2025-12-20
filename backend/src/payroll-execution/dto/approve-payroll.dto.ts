import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ApprovePayrollDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;
}
