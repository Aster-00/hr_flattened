import {
  IsMongoId,
  isMongoId,
  IsOptional,
  isString,
  IsString,
} from 'class-validator';

export class updatePositionDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  departmentId: string;

  @IsOptional()
  @IsMongoId()
  reportsToPositionId?: string;

  @IsOptional()
  isActive: boolean;
}

