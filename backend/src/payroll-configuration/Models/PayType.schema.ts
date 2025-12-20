import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/Models/employee-profile.schema';
import { ConfigStatus, PayType as PayTypeEnum } from '../enums/payroll-configuration-enums';

export type payTypeDocument = HydratedDocument<payType>;

@Schema({ timestamps: true })
export class payType {
  @Prop({ required: true, unique: true, type: String, enum: PayTypeEnum })
  type: PayTypeEnum;

  @Prop({ required: true, min: 6000 })
  amount: number;

  @Prop()
  description?: string;

  @Prop({ required: true, type: String, enum: ConfigStatus, default: ConfigStatus.DRAFT })
  status: ConfigStatus; // draft, approved, rejected

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  createdBy?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  approvedBy?: mongoose.Types.ObjectId;

  @Prop({})
  approvedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  rejectedBy?: mongoose.Types.ObjectId;

  @Prop({})
  rejectedAt?: Date;

  @Prop({})
  rejectionReason?: string;
}

export const payTypeSchema = SchemaFactory.createForClass(payType);
