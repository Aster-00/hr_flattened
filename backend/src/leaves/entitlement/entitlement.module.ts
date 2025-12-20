// src/leaves/entitlement/entitlement.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LeaveEntitlement,
  LeaveEntitlementSchema,
} from '../Models/leave-entitlement.schema';
import {
  LeavePolicy,
  LeavePolicySchema,
} from '../Models/leave-policy.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentSchema,
} from '../Models/leave-adjustment.schema';
import { EntitlementService } from './entitlement.service';
import { EntitlementController } from './entitlement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
    ]),
  ],
  providers: [EntitlementService],
  controllers: [EntitlementController],
  exports: [EntitlementService],
})
export class EntitlementModule {}
