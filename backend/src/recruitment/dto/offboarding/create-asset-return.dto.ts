import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate, IsMongoId, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssetReturnDto {
  @IsNotEmpty()
  @IsString()
  assetName: string;

  @IsOptional()
  @IsString()
  assetDescription?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  assetCategory?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issuedDate?: Date;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  replacementCost?: number;
}
