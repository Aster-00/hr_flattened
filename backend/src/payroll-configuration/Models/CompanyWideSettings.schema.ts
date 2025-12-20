import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export type CompanyWideSettingsDocument = HydratedDocument<CompanyWideSettings>

@Schema({ timestamps: true })
export class CompanyWideSettings {
    @Prop({ required: true, })
    payDate: Date;
    @Prop({ required: true, })
    timeZone: string;
    @Prop({ required: true, default: 'EGP' })
    currency: string; //will allow only egp

    @Prop({ required: true, type: String, enum: ConfigStatus, default: ConfigStatus.DRAFT })
    status: ConfigStatus;

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

export const CompanyWideSettingsSchema = SchemaFactory.createForClass(CompanyWideSettings);