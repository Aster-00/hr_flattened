import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { PayrollExecutionService } from './payroll-execution.service';
import { ApproveBonusDto } from './dto/approve-bonus.dto';
import { ApproveBenefitDto } from './dto/approve-benefit.dto';
import { InitiatePeriodDto } from './dto/initiate-period.dto';
import { EditPeriodDto } from './dto/edit-period.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';
import { ApprovePayrollDto } from './dto/approve-payroll.dto';
import { RejectPayrollDto } from './dto/reject-payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll-execution')
export class PayrollExecutionController {
  constructor(private readonly service: PayrollExecutionService) { }

  // -----------------------
  // PHASE 0 - Pre-run review
  // -----------------------

  /** GET pending items (signing bonuses & termination/resignation benefits) */
  @Get('pending-items')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getPendingItems() {
    return this.service.getPendingItems();
  }

  /** Approve or reject a signing bonus */
  @Put('bonus-status')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async updateBonusStatus(@Body() dto: ApproveBonusDto) {
    return this.service.updateSigningBonusStatus(dto.bonusRecordId, dto.status);
  }

  /** Approve or reject a termination/resignation benefit */
  @Put('benefit-status')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async updateBenefitStatus(@Body() dto: ApproveBenefitDto) {
    return this.service.updateBenefitStatus(dto.benefitRecordId, dto.status);
  }

  /** Edit signing bonus amount (only for PENDING bonuses) */
  @Patch('bonus/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editBonus(@Param('id') id: string, @Body('givenAmount') givenAmount: number) {
    return this.service.editSigningBonus(id, givenAmount);
  }

  /** Edit benefit amount (only for PENDING benefits) */
  @Patch('benefit/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editBenefit(@Param('id') id: string, @Body('givenAmount') givenAmount: number) {
    return this.service.editBenefit(id, givenAmount);
  }


  /** Check whether Phase 0 is complete (no pending items) */
  @Get('validate')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async validatePhase0() {
    const complete = await this.service.validatePhase0Completion();
    return { phase0Complete: complete };
  }

  /** Get the current/latest payroll run (most recent payrollPeriod) */
  @Get('current-run')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.FINANCE_STAFF)
  async getCurrentRun() {
    const run = await this.service.getCurrentPayrollRun();
    if (!run) throw new NotFoundException('No payroll run found');
    return run;
  }

  @Get('history')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.FINANCE_STAFF)
  async getAllRuns() {
    return this.service.getAllRuns();
  }

  // -----------------------
  // PHASE 1 - Payroll Initiation
  // -----------------------

  /**
   * Create or update payroll run (approve payroll period and create a run).
   */
  @Post('initiate')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async initiate(@Body() dto: InitiatePeriodDto) {
    return this.service.initiatePayrollPeriod(dto);
  }

  /** Start the initiation (moves to next phase 1.1) - validates phase0 if required */
  @Post('start-initiation/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async startInitiation(@Param('runId') runId: string) {
    return this.service.startInitiation(runId);
  }

  @Patch('payslip/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async updatePayslip(@Param('id') id: string, @Body() body: UpdatePayslipDto) {
    return this.service.updatePayslip(id, body);
  }

  /** Edit payroll period (allowed after rejection or before finalization) */
  @Put('edit/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editPeriod(@Param('runId') runId: string, @Body() dto: EditPeriodDto) {
    return this.service.editPayrollPeriod(runId, dto);
  }

  /** Reject payroll period */
  @Patch('reject/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async rejectPeriod(
    @Param('runId') runId: string,
    @Body('reason') reason: string,
  ) {
    return this.service.rejectPayrollPeriod(runId, reason);
  }

  /** Submit payroll run for review (Draft -> Under Review) */
  @Patch('submit-review/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async submitReview(@Param('runId') runId: string) {
    return this.service.submitForReview(runId);
  }

  // -----------------------
  // PHASE 3 - Approvals & Execution
  // -----------------------

  @Patch('approve/manager/:runId')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async approveByManager(@Param('runId') runId: string, @Body() dto: ApprovePayrollDto) {
    return this.service.approveByManager(runId, dto.userId);
  }

  @Patch('reject/manager/:runId')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async rejectByManager(@Param('runId') runId: string, @Body() dto: RejectPayrollDto) {
    return this.service.rejectByManager(runId, dto.userId, dto.reason);
  }

  @Patch('approve/finance/:runId')
  @Roles(SystemRole.FINANCE_STAFF)
  async approveByFinance(@Param('runId') runId: string, @Body() dto: ApprovePayrollDto) {
    return this.service.approveByFinance(runId, dto.userId);
  }

  @Patch('reject/finance/:runId')
  @Roles(SystemRole.FINANCE_STAFF)
  async rejectByFinance(@Param('runId') runId: string, @Body() dto: RejectPayrollDto) {
    return this.service.rejectByFinance(runId, dto.userId, dto.reason);
  }

  @Post('execute/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async executePayroll(@Param('runId') runId: string) {
    return this.service.executePayroll(runId);
  }

  @Patch('unfreeze/:runId')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async unfreezePayroll(@Param('runId') runId: string, @Body() body: any) {
    return this.service.unfreezePayroll(runId, body.managerId, body.reason);
  }

  // Phase 4 - Bank File
  @Get('export-bank-file/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async exportBankFile(@Param('runId') runId: string, @Res() res: Response) {
    const buffer = await this.service.exportBankFile(runId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=bank_file_${runId}.pdf`,
      'Content-Length': (buffer as Buffer).length,
    });

    res.end(buffer);
  }

  @Get('run/:runId/anomalies')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getAnomalies(@Param('runId') runId: string) {
    return this.service.getAnomalies(runId);
  }

  /** Resolve an anomaly with notes */
  @Patch('anomaly/resolve/:payslipId')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async resolveAnomaly(@Param('payslipId') payslipId: string, @Body('notes') notes: string) {
    return this.service.resolveAnomaly(payslipId, notes);
  }

  /** Unresolve a previously resolved anomaly */
  @Patch('anomaly/unresolve/:payslipId')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async unresolveAnomaly(@Param('payslipId') payslipId: string) {
    return this.service.unresolveAnomaly(payslipId);
  }


  // Phase 5 - Employee View
  @Roles() // Allow any authenticated user
  @Get('my-payslips')
  async getMyPayslips(@Req() req: any) {
    const user = req.user;
    return this.service.getMyPayslips(user.id);
  }

  // Helper for Frontend Review
  @Get('run/:runId/payslips')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.FINANCE_STAFF)
  async getPayslipsForRun(@Param('runId') runId: string) {
    return this.service.getPayslipsForRun(runId);
  }

  @Get('payslip/detail/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.SYSTEM_ADMIN, SystemRole.FINANCE_STAFF)
  async getPayslipById(@Param('id') id: string) {
    return this.service.getPayslipById(id);
  }

  // -----------------------
  // REPORTS
  // -----------------------

  /** Get payroll summary report with breakdowns */
  @Get('report/summary/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getPayrollSummaryReport(@Param('runId') runId: string) {
    return this.service.getPayrollSummaryReport(runId);
  }

  /** Get tax report for a payroll run */
  @Get('report/tax/:runId')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getTaxReport(@Param('runId') runId: string) {
    return this.service.getTaxReport(runId);
  }

  /** Get audit log of manual adjustments */
  @Get('audit-log')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAuditLog() {
    return this.service.getAuditLog();
  }
}

