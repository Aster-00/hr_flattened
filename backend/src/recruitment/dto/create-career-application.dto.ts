import { IsEmail, IsNotEmpty, IsString, IsOptional, IsMongoId, IsDateString, IsEnum } from 'class-validator';
import { Gender } from '../../employee-profile/enums/employee-profile.enums';

export class CreateCareerApplicationDto {
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
  @IsNotEmpty()
  nationalId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsMongoId()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsNotEmpty()
  resumeUrl: string;
}
