import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/settlement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('calculate')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async calculateFinalSettlement(
    @Body() body: { employeeId: string; lastWorkingDay: string }
  ) {
    console.log('💰 Calculating final settlement:', { employeeId: body.employeeId, lastWorkingDay: body.lastWorkingDay });
    return this.settlementService.calculateFinalSettlement(
      body.employeeId,
      new Date(body.lastWorkingDay)
    );
  }
}
