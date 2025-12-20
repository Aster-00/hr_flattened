import { PartialType } from '@nestjs/mapped-types';
import { CreateTerminationBenefitDto } from './create-termination-benefit.dto';

export class UpdateTerminationBenefitDto extends PartialType(CreateTerminationBenefitDto) { }
