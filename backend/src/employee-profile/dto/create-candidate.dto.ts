import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { SystemRole } from '../enums/employee-profile.enums';

export class CreateCandidateDto {
  // Support both fullName and firstName/lastName for flexibility
  fullName?: string;
  firstName?: string;
  lastName?: string;
  
  personalEmail: string;
  mobilePhone?: string;
  
  password?: string;
  nationalId: { type: String, required: false }

  @IsEnum(SystemRole, { each: true })
  @IsArray()
  @IsOptional()
  roles?: SystemRole[];

  departmentId?: string;
  positionId?: string;

  resumeUrl?: string;
  notes?: string;
}
