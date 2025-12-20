import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import {
  ContractType,
  EmployeeStatus,
  WorkType,
  MaritalStatus,
} from '../enums/employee-profile.enums';
import { AppraisalRatingScaleType } from '../../performance/enums/performance.enums';

export class UpdateEmployeeAdminDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEnum(MaritalStatus) maritalStatus?: MaritalStatus;

  @IsOptional() @IsString() employeeNumber?: string;
  @IsOptional() @IsDateString() dateOfHire?: string;
  @IsOptional() @IsString() workEmail?: string;
  @IsOptional() @IsString() biography?: string;

  @IsOptional() @IsDateString() contractStartDate?: string;
  @IsOptional() @IsDateString() contractEndDate?: string;

  @IsOptional() @IsEnum(ContractType) contractType?: ContractType;
  @IsOptional() @IsEnum(WorkType) workType?: WorkType;

  @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
  @IsOptional() @IsDateString() statusEffectiveFrom?: string;

  // Banking details
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankAccountNumber?: string;

  // Org Structure links
  @IsOptional() @IsString() primaryPositionId?: string;
  @IsOptional() @IsString() primaryDepartmentId?: string;
  @IsOptional() @IsString() supervisorPositionId?: string;

  @IsOptional() @IsString() payGradeId?: string;

  // Performance & Appraisal
  @IsOptional() @IsString() lastAppraisalRecordId?: string;
  @IsOptional() @IsString() lastAppraisalCycleId?: string;
  @IsOptional() @IsString() lastAppraisalTemplateId?: string;
  @IsOptional() @IsDateString() lastAppraisalDate?: string;
  @IsOptional() @IsNumber() lastAppraisalScore?: number;
  @IsOptional() @IsString() lastAppraisalRatingLabel?: string;
  @IsOptional() @IsEnum(AppraisalRatingScaleType) lastAppraisalScaleType?: AppraisalRatingScaleType;
  @IsOptional() @IsString() lastDevelopmentPlanSummary?: string;

  @IsOptional() @IsString({ each: true }) permissions?: string[];
  @IsOptional() @IsString({ each: true }) roles?: string[];
}
