import { IsMongoId, IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsIP, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateApplicationDto {
  @IsMongoId()
  @IsNotEmpty()
  candidateId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  requisitionId: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isReferral?: boolean;

  @IsMongoId()
  @IsOptional()
  referralId?: Types.ObjectId;

  // GDPR Consent Fields (REC-028)
  @IsBoolean()
  @IsNotEmpty()
  consentGiven: boolean;

  @IsBoolean()
  @IsOptional()
  consentDataProcessing?: boolean; // Consent for general data processing

  @IsBoolean()
  @IsOptional()
  consentBackgroundCheck?: boolean; // Consent for background checks

  @IsString()
  @IsOptional()
  consentIpAddress?: string; // IP address when consent was given

  @IsDateString()
  @IsOptional()
  consentTimestamp?: string; // When consent was given

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
