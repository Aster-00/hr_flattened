
import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
// import {  EmployeeProfile as Employee} from '../../employee-profile/Models/employee-profile.schema';
import { Applicability, ConfigStatus, PolicyType } from '../enums/payroll-configuration-enums';

export type payrollPoliciesDocument = HydratedDocument<payrollPolicies>

@Schema({ timestamps: true })
class RuleDefinition {
    @Prop({ required: true, min: 0, max: 100 })
    percentage: number;
    @Prop({ required: true, min: 0 })
    fixedAmount: number;
    @Prop({ required: true, min: 1 })
    thresholdAmount: number;
}
const RuleDefinitionSchema = SchemaFactory.createForClass(RuleDefinition)

@Schema({ timestamps: true })
export class payrollPolicies {
    @Prop({ required: true, })
    policyName: string;

    @Prop({ required: true, type: String, enum: PolicyType })
    policyType: PolicyType;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    effectiveDate: Date;

    @Prop({ required: true, type: RuleDefinitionSchema })
    ruleDefinition: RuleDefinition;

    @Prop({ required: true, enum: Applicability, type: String })
    applicability: Applicability;

    @Prop({ required: true, type: String, enum: ConfigStatus,default:ConfigStatus.DRAFT })
    status: ConfigStatus;// draft, approved, rejected

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'employee-profile' })
    createdBy?: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'employee-profile' })
    approvedBy?: mongoose.Types.ObjectId;
    @Prop({})
    approvedAt?: Date;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'employee-profile' })
    rejectedBy?: mongoose.Types.ObjectId;
    @Prop({})
    rejectedAt?: Date;
    @Prop({})
    rejectionReason?: string;

}

export const payrollPoliciesSchema = SchemaFactory.createForClass(payrollPolicies);





