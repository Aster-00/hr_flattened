import { IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class PersonalizedEntitlementDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  leaveTypeId: string;

  @IsNumber()
  @IsOptional()
  personalizedEntitlement?: number;

  // Support frontend field name
  @IsNumber()
  @IsOptional()
  totalEntitlement?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  carriedOver?: number;
}
