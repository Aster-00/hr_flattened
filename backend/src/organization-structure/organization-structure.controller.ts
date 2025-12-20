import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { OrganizationStructureService } from './organization-structure.service';
import { createDepartmentDto } from './dto/createDepartment.dto';
import { updateDepartmentDto } from './dto/updateDepartment.dto';
import { createPositionDto } from './dto/createPosition.dto';
import { updatePositionDto } from './dto/Updateposition.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(private svc: OrganizationStructureService) { }

  // System Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Post('departments')
  async createDepartment(@Body() dto: createDepartmentDto) {
    return this.svc.createDepartment(dto);
  }

  // Get all departments - HR roles and System Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE)
  @Get('departments')
  async getAllDepartments() {
    return this.svc.getAllDepartments();
  }

  // System Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Put('departments/:id')
  async updateDepartment(@Param('id') id: string, @Body() dto: updateDepartmentDto) {
    return this.svc.updateDepartment(id, dto);
  }

  // System Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Delete('departments/:id')
  async deleteDepartment(@Param('id') id: string) {
    return this.svc.deleteDepartment(id);
  }

  // System Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Post('positions')
  async createPosition(@Body() dto: createPositionDto) {
    return this.svc.createPosition(dto);
  }

  // Get all positions - HR roles and System Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE)
  @Get('positions')
  async getAllPositions() {
    return this.svc.getAllPositions();
  }

  // System Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Put('positions/:id')
  async updatePosition(@Param('id') id: string, @Body() dto: updatePositionDto) {
    return this.svc.updatePosition(id, dto);
  }

  @Roles(SystemRole.SYSTEM_ADMIN)
  @Delete('positions/:id')
  async deletePosition(@Param('id') id: string, @Req() { user }) {
    return this.svc.deletePosition(id, "");
  }

  // View hierarchy - system admin, manager, employee
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN)
  @Get('hierarchy/:employeeId')
  async viewHierarchy(@Param('employeeId') employeeId: string) {
    return this.svc.viewHierarchy(employeeId);
  }

  // Managers and System Admin can create department change requests
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD)
  @Post('change-request/department')
  async createDepartmentChangeReq(@Req() { user }, @Body() body: { managerId: string; employeeId: string; oldDept: string; newDept: string }) {
    // managerId may come from body or token
    const managerId = body.managerId ?? user.id;
    return this.svc.createDepartmentChangeReq(managerId, body.employeeId, body.oldDept, body.newDept);
  }

  // Managers and System Admin can create position change requests
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD)
  @Post('change-request/position')
  async createPositionChangeReq(@Req() { user }, @Body() body: { managerId: string; employeeId: string; oldPos: string; newPos: string }) {
    const managerId = body.managerId ?? user.id;
    return this.svc.createPositionChangeReq(managerId, body.employeeId, body.oldPos, body.newPos);
  }

  // System Admin review change request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @Post('change-request/:id/review')
  async reviewChangeRequest(@Param('id') id: string, @Body() body: { approve: boolean }) {
    return this.svc.reviewChangeRequest(id, body.approve);
  }
}
