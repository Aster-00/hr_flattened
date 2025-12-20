import { IsMongoId, IsNumber } from 'class-validator';

export class CreateEntitlementDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  yearlyEntitlement: number;
}
