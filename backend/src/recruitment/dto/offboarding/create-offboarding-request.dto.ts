import { IsNotEmpty, IsString, IsOptional, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOffboardingRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  employeeComments?: string;

  @IsOptional()
  @IsString()
  hrComments?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expectedExitDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  actualExitDate?: Date;

  @IsOptional()
  @IsMongoId()
  terminationRequestId?: string;
}
