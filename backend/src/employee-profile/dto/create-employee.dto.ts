import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import {
  ContractType,
  EmployeeStatus,
  WorkType,
} from '../enums/employee-profile.enums';

export class CreateEmployeeDto {
  @IsString() employeeNumber: string;

  @IsDateString() dateOfHire: string;

  @IsOptional() @IsString() workEmail?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsString() biography?: string;

  @IsOptional() @IsDateString() contractStartDate?: string;
  @IsOptional() @IsDateString() contractEndDate?: string;

  @IsOptional() @IsEnum(ContractType) contractType?: ContractType;
  @IsOptional() @IsEnum(WorkType) workType?: WorkType;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional() @IsDateString() statusEffectiveFrom?: string;

  @IsOptional() @IsString() primaryPositionId?: string;
  @IsOptional() @IsString() primaryDepartmentId?: string;
  @IsOptional() @IsString() supervisorPositionId?: string;
  @IsOptional() @IsString() payGradeId?: string;
}
