import { PartialType } from '@nestjs/mapped-types';
import { CreateLeavePolicyDto } from './create-policy.dto';

export class UpdateLeavePolicyDto extends PartialType(CreateLeavePolicyDto) {}
