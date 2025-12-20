import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ApplicationStatusHistory {

  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  @Prop()
  oldStage: string;

  @Prop()
  newStage: string;

  @Prop()
  oldStatus: string;

  @Prop()
  newStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  changedBy: Types.ObjectId;

  @Prop()
  changedAt: Date;

  @Prop()
  notes: string;
}

export type ApplicationStatusHistoryDocument =
  HydratedDocument<ApplicationStatusHistory>;
export const ApplicationStatusHistorySchema =
  SchemaFactory.createForClass(ApplicationStatusHistory);