import { Controller, Post, Param, Get, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { PunchDto } from '../dto/punch.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Get(':employeeId')
  findForEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findForEmployee(employeeId);
  }

  @Roles(SystemRole.HR_ADMIN)
  @Post('punch')
  punch(@Body() body: PunchDto) {
    return this.svc.processPunch(body);
  }
}
