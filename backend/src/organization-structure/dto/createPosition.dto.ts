import {
  IsMongoId,
  isMongoId,
  IsOptional,
  isString,
  IsString,
} from 'class-validator';

export class createPositionDto {
  @IsString()
  code: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  descrition?: string;

  @IsMongoId()
  departmentId: string;

  @IsOptional()
  @IsMongoId()
  reportsToPositionId?: string;

  @IsString()
  isActive: string;
}

