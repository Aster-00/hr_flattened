import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShiftAssignmentService } from '../services/shift-assignment.service';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shift-assignments')
export class ShiftAssignmentController {
  constructor(private readonly svc: ShiftAssignmentService) {}

  // ======================================
  // EMPLOYEES LIST (FOR ASSIGNMENT UI)
  // ⚠ MUST BE ABOVE :id ROUTES
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN
  )
  @Get('employees')
  getEmployeesForAssignment() {
    return this.svc.getEmployeesForAssignment();
  }

  // ======================================
  // CREATE ASSIGNMENT
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN
  )
  @Post()
  create(@Body() dto: CreateShiftAssignmentDto) {
    return this.svc.create(dto);
  }

  // ======================================
  // VIEW ALL ASSIGNMENTS
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN
  )
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  // ======================================
  // VIEW ASSIGNMENTS FOR EMPLOYEE
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN
  )
  @Get('employee/:employeeId')
  findForEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findForEmployee(employeeId);
  }

  // ======================================
  // VIEW SINGLE ASSIGNMENT (EDIT PAGE)
  // ⚠ MUST COME AFTER STATIC ROUTES
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // ======================================
  // UPDATE ASSIGNMENT (ONLY PENDING)
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  // ======================================
  // APPROVAL WORKFLOW
  // ======================================
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN
  )
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.svc.approve(id);
  }

  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN
  )
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.svc.reject(id);
  }
}
