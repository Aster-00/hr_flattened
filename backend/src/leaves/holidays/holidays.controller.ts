// src/leaves/holidays/holidays.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

// adjust import paths as in your project
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  // View can be broader if you want (e.g., everyone); for now keep it protected but no role restriction
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
    console.log('🔍 [HolidaysController] findAll');
    return this.holidaysService.findAll();
  }

  // Only HR/System Admin/HR Manager can manage holidays
  @Post()
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  create(@Body() dto: CreateHolidayDto) {
    console.log('🔍 [HolidaysController] create:', dto);
    return this.holidaysService.create(dto);
  }

  // ==================== PARAMETRIC ROUTES ====================

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
    console.log('🔍 [HolidaysController] findOne:', { id });
    return this.holidaysService.findOne(id);
  }

  @Put(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    console.log('🔍 [HolidaysController] update:', { id, dto });
    return this.holidaysService.update(id, dto);
  }

  @Delete(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  delete(@Param('id') id: string) {
    console.log('🔍 [HolidaysController] delete:', { id });
    return this.holidaysService.delete(id);
  }
}
