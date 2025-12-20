 import { IsMongoId, isMongoId, IsOptional, IsString } from "class-validator";
 import { IsBoolean} from 'class-validator';
 
 export class updateDepartmentDto{

    @IsString()
    code: string;
    
    @IsOptional()
    @IsString()
    name: string;
     
    @IsOptional()
    @IsString()
     description?: string; 
 
    @IsOptional()
    @IsMongoId()
    headPositionId?: string;
    
    @IsOptional()
    @IsBoolean()
    isActive: boolean;
 }