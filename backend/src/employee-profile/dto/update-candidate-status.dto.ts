import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { CandidateStatus } from '../enums/employee-profile.enums';

export class UpdateCandidateStatusDto {
  @IsEnum(CandidateStatus)
  status: CandidateStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsMongoId()
  @IsOptional()
  applicationId?: string;
}
