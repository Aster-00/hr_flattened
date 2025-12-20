import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';
import { PunchType } from '../Models/enums/index';

export class PunchDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsEnum(PunchType)
  punchType: PunchType;

  @IsNotEmpty()
  @IsDateString()
  time: string;
}
