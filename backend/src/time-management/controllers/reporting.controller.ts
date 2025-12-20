import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express'; // ✅ FIX
import { ReportingService } from '../services/reporting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/reports')
export class ReportingController {
  constructor(private readonly svc: ReportingService) {}

  // ================= Exceptions Summary =================
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
      SystemRole.DEPARTMENT_EMPLOYEE,
      SystemRole.FINANCE_STAFF,
      SystemRole.PAYROLL_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('exceptions-summary')
  exceptionsSummary(
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.svc.exceptionsSummary(from, to);
  }

  // ================= Export Exceptions =================
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.PAYROLL_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('exceptions-summary/export')
  async exportExceptions(
      @Res({ passthrough: true }) res: Response, // ✅ FIX
  ) {
    const csv = await this.svc.exportExceptionsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="exceptions-summary.csv"',
    );
    return csv;
  }

  // ================= Overtime Summary =================
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
      SystemRole.FINANCE_STAFF,
      SystemRole.PAYROLL_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('overtime-summary')
  overtimeSummary(
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.svc.overtimeSummary(from, to);
  }

  // ================= Export Overtime =================
  @Roles(
      SystemRole.PAYROLL_MANAGER,
      SystemRole.FINANCE_STAFF,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('overtime-summary/export')
  async exportOvertime(
      @Res({ passthrough: true }) res: Response, // ✅ FIX
  ) {
    const csv = await this.svc.exportOvertimeCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="overtime-summary.csv"',
    );
    return csv;
  }

  // ================= Lateness Summary =================
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.DEPARTMENT_HEAD,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('lateness-summary')
  latenessSummary(
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.svc.latenessSummary(from, to);
  }

  // ================= Dashboard KPIs =================
  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get('dashboard-kpis')
  dashboardKpis() {
    return this.svc.dashboardKpis();
  }
}
