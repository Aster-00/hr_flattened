// src/leaves/tracking/tracking.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { HistoryFilterDto } from './dto/history-filter.dto';

// Auth + roles (adjust paths if needed)
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // REQ-031: employee current balance
  @Get('me/balances')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
    SystemRole.FINANCE_STAFF,
  )
  getMyBalances(@Query() query: BalanceQueryDto, @Req() req) {
    console.log('🔍 [TrackingController] getMyBalances:', { query, userId: req.user.id });
    const userId = req.user.id as string;
    // Ignore employeeId in query; trust JWT
    return this.trackingService.getMyCurrentBalances(query, userId);
  }

  // REQ-032/033: employee history
  @Get('me/history')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
    SystemRole.FINANCE_STAFF,
  )
  getMyHistory(@Query() filters: HistoryFilterDto, @Req() req) {
    console.log('🔍 [TrackingController] getMyHistory:', { filters, userId: req.user.id });
    const userId = req.user.id as string;
    return this.trackingService.getMyHistory(filters, userId);
  }

  // REQ-034/035: team views (manager / HR)
  @Get('team/balances')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  getTeamBalances(@Query() filters: HistoryFilterDto, @Req() req) {
    const managerId = (req.user._id || req.user.id) as string;
    console.log('🔍 [TrackingController] getTeamBalances:', { filters, managerId });
    return this.trackingService.getTeamBalances(managerId, filters);
  }

  @Get('team/history')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  getTeamHistory(@Query() filters: HistoryFilterDto, @Req() req) {
    const managerId = (req.user._id || req.user.id) as string;
    console.log('🔍 [TrackingController] getTeamHistory:', { filters, managerId });
    return this.trackingService.getTeamHistory(managerId, filters);
  }

  // REQ-039: flag irregular patterns
  @Post('flag-irregular')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  flagIrregular(@Body('requestId') requestId: string) {
    console.log('🔍 [TrackingController] flagIrregular:', { requestId });
    return this.trackingService.flagIrregularPattern(requestId);
  }

  // REQ-040: accrual job
  @Post('run-accrual')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  runAccrual() {
    console.log('🔍 [TrackingController] runAccrual');
    return this.trackingService.runAccrualJob();
  }

  // REQ-041: carry-forward job
  @Post('run-carry-forward')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  runCarryForward() {
    console.log('🔍 [TrackingController] runCarryForward');
    return this.trackingService.runCarryForwardJob();
  }

  // Pattern detection: irregular leave patterns
  @Get('irregular-patterns')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async getIrregularPatterns(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    console.log('📊 [TrackingController] getIrregularPatterns:', { startDate, endDate });
    return this.trackingService.detectIrregularPatterns({ startDate, endDate });
  }

  // Pattern analysis for specific employee
  @Get('patterns/:employeeId')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async getEmployeePattern(@Param('employeeId') employeeId: string) {
    console.log('📊 [TrackingController] getEmployeePattern:', { employeeId });
    return this.trackingService.analyzeEmployeePattern(employeeId);
  }
}
