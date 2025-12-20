import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CandidateStatus } from '../enums/employee-profile.enums';
import { Department } from '../../organization-structure/Models/department.schema';
import { Position } from '../../organization-structure/Models/position.schema';
import { UserProfileBase } from './user-schema';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ collection: 'candidates', timestamps: true })
export class Candidate extends UserProfileBase {
  @Prop({ type: String, required: true, unique: true })
  candidateNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  positionId?: Types.ObjectId;

  @Prop({ type: Date })
  applicationDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(CandidateStatus),
    default: CandidateStatus.APPLIED,
  })
  status: CandidateStatus;

  @Prop({ type: String })
  resumeUrl?: string;

  @Prop({ type: String })
  notes?: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

import bcrypt from 'bcryptjs';

CandidateSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      next();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);

    next();
  } catch (err) {
    next(err as any);
  }
});
