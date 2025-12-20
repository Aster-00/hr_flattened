import { IsMongoId, isMongoId, IsOptional, IsString } from "class-validator";
import { IsBoolean} from 'class-validator';

export class createDepartmentDto{
    @IsString()
    code: string;

    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    description?: string; 

    @IsBoolean()
    isActive: boolean;
}