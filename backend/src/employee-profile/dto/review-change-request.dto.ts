// review-change-request.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

export class ReviewChangeRequestDto {
  @IsEnum(ProfileChangeStatus)
  action: ProfileChangeStatus;

  @IsOptional()
  patch?: any;
}
