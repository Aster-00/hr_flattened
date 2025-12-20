import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { LeaveAdjustment, LeaveAdjustmentSchema } from '../Models/leave-adjustment.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema }])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService]
})
export class AuditModule {}
