import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { LeaveEntitlement, LeaveEntitlementSchema } from '../Models/leave-entitlement.schema';
import { LeaveType, LeaveTypeSchema } from '../Models/leave-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema }
    ])
  ],
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService]
})
export class SettlementModule {}
