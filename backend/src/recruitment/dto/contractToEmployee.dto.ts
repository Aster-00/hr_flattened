import { IsMongoId, IsOptional, IsEnum, IsArray } from 'class-validator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export class ContractTpEmployeeDto {
  @IsMongoId()
  employeeId: string;

  @IsOptional()
  @IsArray()
  @IsEnum(SystemRole, { each: true })
  roles?: SystemRole[];
}
