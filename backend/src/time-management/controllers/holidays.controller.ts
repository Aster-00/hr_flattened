import { Controller, Post, Body, Get, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';
import { HolidaysService } from '../services/holidays.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-management/holidays')
export class HolidaysController {
  constructor(private readonly svc: HolidaysService) {}

  // Only HR Admin + System Admin can create holidays
 
   @Roles(SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN
    )
  @Post()
  create(@Body() dto: CreateHolidayDto) {
    return this.svc.createHoliday(dto);
  }

  // All employees, managers, HR, admins can view holiday calendar
  
   @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.DEPARTMENT_HEAD,
        SystemRole.SYSTEM_ADMIN
  )
  @Get()
  list() {
    return this.svc.findAll();
  }

  // Everyone can view a single holiday
  
   @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.DEPARTMENT_HEAD,
        SystemRole.SYSTEM_ADMIN
  )
  @Get(':id')
  async get(@Param('id') id: string) {
    const h = await this.svc.findById(id);
    if (!h) throw new NotFoundException('Holiday not found');
    return h;
  }

  // Only HR Admin + System Admin can update holidays

   @Roles(SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN
  )
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.svc.update(id, dto);
  }

  // Only HR Admin + System Admin can delete holidays
 
   @Roles(SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
