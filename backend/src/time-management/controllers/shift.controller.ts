import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { ShiftService } from '../services/shift.service';

import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

 @UseGuards(JwtAuthGuard, RolesGuard) // still commented for dev

@Controller('shifts')
export class ShiftController {
  constructor(private readonly svc: ShiftService) {}

  // Create shift → HR Admin, HR Manager, System Admin
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.svc.create(dto);
  }

  // View all shifts → Everyone (including employees)
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN,
  )
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // View single shift → Everyone
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN,
  )
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Shift ID is required');
    }

    const shift = await this.svc.findOne(id);

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  // Update shift → HR Admin, HR Manager, System Admin
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.svc.update(id, dto);
  }
}
