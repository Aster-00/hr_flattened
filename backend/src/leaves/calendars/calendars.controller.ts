// src/leaves/calendars/calendars.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { UpdateBlockedPeriodDto } from './dto/update-blocked-period.dto';

// adjust import paths to your auth module
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/calendars')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  // ==================== SPECIFIC ROUTES (MUST COME FIRST) ====================

  // REQ-005: Calculate working days between two dates
  @Get('working-days')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
  )
  async calculateWorkingDays(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    console.log('🔍 [CalendarsController] calculateWorkingDays:', { from, to });
    return this.calendarsService.calculateWorkingDays(from, to);
  }

  // REQ-008: Check for blocked periods
  @Get('check-blocked-periods')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
  )
  async checkBlockedPeriods(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    console.log('🔍 [CalendarsController] checkBlockedPeriods:', { from, to });
    return this.calendarsService.checkBlockedPeriods(from, to);
  }

  // REQ-010: Get all blocked periods
  @Get('blocked-periods')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
  )
  async getBlockedPeriods() {
    console.log('🔍 [CalendarsController] getBlockedPeriods');
    return this.calendarsService.getBlockedPeriods();
  }

  // REQ-010: Create blocked period
  @Post('blocked-periods')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async createBlockedPeriod(
    @Body() dto: { name: string; from: string; to: string; reason?: string },
  ) {
    console.log('🔍 [CalendarsController] createBlockedPeriod:', dto);
    return this.calendarsService.createBlockedPeriod(dto);
  }

  // REQ-010: Update blocked period
  @Patch('blocked-periods/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async updateBlockedPeriod(@Param('id') id: string, @Body() dto: UpdateBlockedPeriodDto) {
    console.log('🔍 [CalendarsController] updateBlockedPeriod:', { id, dto });
    const updated = await this.calendarsService.updateBlockedPeriod(id, dto);
    if (!updated) throw new NotFoundException(`Blocked period ${id} not found`);
    return updated;
  }

  // REQ-010: Delete blocked period
  @Delete('blocked-periods/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async deleteBlockedPeriod(@Param('id') id: string) {
    console.log('🔍 [CalendarsController] deleteBlockedPeriod:', { id });
    return this.calendarsService.deleteBlockedPeriod(id);
  }

  // Viewing calendars can be open to all authenticated users
  @Get()
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
  )
  findAll() {
    console.log('🔍 [CalendarsController] findAll');
    return this.calendarsService.findAll();
  }

  // HR/system only: define company calendars/blocked periods
  @Post()
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  create(@Body() dto: CreateCalendarDto) {
    console.log('🔍 [CalendarsController] create:', dto);
    return this.calendarsService.create(dto);
  }

  // ==================== PARAMETRIC ROUTES (MUST COME LAST) ====================

  @Get(':id')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
  )
  findOne(@Param('id') id: string) {
    console.log('🔍 [CalendarsController] findOne:', { id });
    return this.calendarsService.findOne(id);
  }

  @Put(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  update(@Param('id') id: string, @Body() dto: UpdateCalendarDto) {
    console.log('🔍 [CalendarsController] update:', { id, dto });
    return this.calendarsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  delete(@Param('id') id: string) {
    console.log('🔍 [CalendarsController] delete:', { id });
    return this.calendarsService.delete(id);
  }

  // ==================== HOLIDAY MANAGEMENT ====================

  @Post(':calendarId/holidays')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async addHoliday(
    @Param('calendarId') calendarId: string,
    @Body() dto: { date: string; name: string; description?: string },
  ) {
    console.log('🔍 [CalendarsController] addHoliday:', { calendarId, dto });
    return this.calendarsService.addHoliday(calendarId, dto);
  }

  @Delete(':calendarId/holidays/:holidayId')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async deleteHoliday(
    @Param('calendarId') calendarId: string,
    @Param('holidayId') holidayId: string,
  ) {
    console.log('🔍 [CalendarsController] deleteHoliday:', { calendarId, holidayId });
    return this.calendarsService.deleteHoliday(calendarId, holidayId);
  }
}
