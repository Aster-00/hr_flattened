import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsEmail,
  IsMongoId,
  IsObject,
  IsArray,
} from 'class-validator';

import {
  Gender,
  MaritalStatus,
  ContractType,
  WorkType,
  EmployeeStatus,
  SystemRole
} from  '../enums/employee-profile.enums';


export class RegisterEmployeeDto {

  // ===========================================
  // USER PROFILE BASE
  // ===========================================

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @IsString()
  @IsOptional()
  mobilePhone?: string;

  @IsString()
  @IsOptional()
  homePhone?: string;

  @IsObject()
  @IsOptional()
  address?: {
    city?: string;
    streetAddress?: string;
    country?: string;
  };

  @IsString()
  @IsOptional()
  profilePictureUrl?: string;

  // ===========================================
  // EMPLOYEE PROFILE
  // ===========================================

  @IsDateString()
  @IsNotEmpty()
  dateOfHire: string;

  @IsEmail()
  @IsOptional()
  workEmail?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsDateString()
  @IsOptional()
  contractStartDate?: string;

  @IsDateString()
  @IsOptional()
  contractEndDate?: string;

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType;

  @IsEnum(WorkType)
  @IsOptional()
  workType?: WorkType;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsMongoId()
  @IsOptional()
  primaryPositionId?: string;

  @IsMongoId()
  @IsOptional()
  primaryDepartmentId?: string;

  @IsMongoId()
  @IsOptional()
  supervisorPositionId?: string;

  @IsMongoId()
  @IsOptional()
  payGradeId?: string;

  // ===========================================
  // ROLE ASSIGNMENT (NEW — FOR ALL USERS)
  // ===========================================

  @IsEnum(SystemRole, { each: true })
  @IsArray()
  @IsOptional()
  roles?: SystemRole[];

  @IsArray()
  @IsOptional()
  permissions?: string[];
}
