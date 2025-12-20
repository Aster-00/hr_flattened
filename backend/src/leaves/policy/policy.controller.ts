// src/leaves/policy/policy.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeavePolicyService } from './policy.service';
import { CreateLeavePolicyDto } from './dto/create-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-policy.dto';

// auth + roles (adjust paths to your auth module)
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leave-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavePolicyController {
  constructor(private readonly service: LeavePolicyService) {}

  // Read can be open to all authenticated users
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
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
    SystemRole.FINANCE_STAFF,
  )
  findAll() {
    console.log('🔍 [LeavePolicyController] findAll');
    return this.service.findAll();
  }

  // Only HR/System admins should create policies
  @Post()
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  create(@Body() dto: CreateLeavePolicyDto) {
    console.log('🔍 [LeavePolicyController] create:', dto);
    return this.service.create(dto);
  }

  // ==================== PARAMETRIC ROUTES ====================

  // Get policy by leave type ID
  @Get('leave-type/:leaveTypeId')
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
  async getPolicyByLeaveType(@Param('leaveTypeId') leaveTypeId: string) {
    console.log('🔍 [LeavePolicyController] getPolicyByLeaveType:', { leaveTypeId });
    return this.service.findByLeaveTypeId(leaveTypeId);
  }

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
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
    SystemRole.FINANCE_STAFF,
  )
  findOne(@Param('id') id: string) {
    console.log('🔍 [LeavePolicyController] findOne:', { id });
    return this.service.findOne(id);
  }

  // Update/delete restricted to HR/System admins
  @Patch(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  update(@Param('id') id: string, @Body() dto: UpdateLeavePolicyDto) {
    console.log('🔍 [LeavePolicyController] update:', { id, dto });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  remove(@Param('id') id: string) {
    console.log('🔍 [LeavePolicyController] remove:', { id });
    return this.service.remove(id);
  }
}
