import { IsMongoId, IsNotEmpty, IsNumber, IsString, IsOptional, IsDate, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateOfferDto {
  @IsMongoId()
  @IsNotEmpty()
  applicationId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  candidateId: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  hrEmployeeId?: Types.ObjectId;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  grossSalary: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  signingBonus?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @IsString()
  @IsOptional()
  conditions?: string;

  @IsString()
  @IsOptional()
  insurances?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  deadline: Date;

  @IsArray()
  @IsOptional()
  approvers?: {
    employeeId: Types.ObjectId;
    role: string;
  }[];
}
