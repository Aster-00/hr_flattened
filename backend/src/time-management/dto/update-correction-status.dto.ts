import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CorrectionRequestStatus } from '../Models/enums/index';

export class UpdateCorrectionStatusDto {
  @IsEnum(CorrectionRequestStatus)
  status: CorrectionRequestStatus;

  @IsOptional()
  @IsString()
  managerComment?: string;
}
