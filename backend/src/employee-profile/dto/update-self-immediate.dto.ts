import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateEmployeeSelfImmediateDto {
  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  workEmail?: string;

  @IsOptional() @IsString()
  biography?: string;

  @IsOptional()
  @IsObject()
  address?: {
    city?: string;
    streetAddress?: string;
    country?: string;
  };
}
