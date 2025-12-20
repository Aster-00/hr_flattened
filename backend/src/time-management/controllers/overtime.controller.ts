import { Controller, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { OvertimeService } from '../services/overtime.service';
import { OvertimeRequestDto } from '../dto/overtime-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('attendance/overtime')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OvertimeController {
  constructor(private readonly svc: OvertimeService) {}

  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  @Post()
  create(@Body() dto: OvertimeRequestDto) {
    return this.svc.createRequest(dto);
  }

  
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  @Patch(':id')
  review(@Param('id') id: string, @Body() dto: any) {
    return this.svc.review(id, dto);
  }
}
