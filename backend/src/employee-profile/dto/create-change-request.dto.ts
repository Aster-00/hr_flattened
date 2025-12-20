import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateEmployeeChangeRequestDto {
  
  @IsString()
  requestDescription: string;

  @IsOptional() @IsString()
  reason?: string;
}
