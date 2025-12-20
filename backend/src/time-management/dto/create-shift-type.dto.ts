import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateShiftTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
