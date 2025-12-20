import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto';
import { CreateAppraisalRecordDto, UpdateAppraisalRecordDto } from './dto/create-appraisal-record.dto';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { AppraisalDisputeStatus } from './enums/performance.enums';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ========== APPRAISAL TEMPLATE ENDPOINTS ==========

  @Post('templates')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(dto);
  }

  @Get('templates')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAllTemplates(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly === 'true';
    return this.performanceService.findAllTemplates(active);
  }

  @Get('templates/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN,
  )
  async findTemplateById(@Param('id') id: string) {
    return this.performanceService.findTemplateById(id);
  }

  @Put('templates/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async deleteTemplate(@Param('id') id: string) {
    await this.performanceService.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }

  // ========== APPRAISAL CYCLE ENDPOINTS ==========

  @Post('cycles')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createCycle(@Body() dto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  @Get('cycles')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAllCycles() {
    return this.performanceService.findAllCycles();
  }

  @Get('cycles/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.SYSTEM_ADMIN,
  )
  async findCycleById(@Param('id') id: string) {
    return this.performanceService.findCycleById(id);
  }

  @Put('cycles/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateCycle(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalCycleDto,
  ) {
    return this.performanceService.updateCycle(id, dto);
  }

  @Delete('cycles/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async deleteCycle(@Param('id') id: string) {
    await this.performanceService.deleteCycle(id);
    return { message: 'Cycle deleted successfully' };
  }

  // ========== APPRAISAL ASSIGNMENT ENDPOINTS ==========

  @Post('cycles/:cycleId/assignments')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createAssignments(
    @Param('cycleId') cycleId: string,
    @Body() body: { employeeIds: string[]; templateId: string },
    @Request() req: any,
  ) {
    return this.performanceService.createAssignments(
      cycleId,
      body.employeeIds,
      body.templateId,
      req.user?.id,
    );
  }

  @Get('assignments/manager/:managerId')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAssignmentsByManager(@Param('managerId') managerId: string) {
    return this.performanceService.findAssignmentsByManager(managerId);
  }

  @Get('assignments/employee/:employeeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAssignmentsByEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.findAssignmentsByEmployee(employeeId);
  }

  @Get('assignments/pending')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getPendingAssignmentsForReminders(@Query('cycleId') cycleId?: string) {
    return this.performanceService.getPendingAssignmentsForReminders(cycleId);
  }

  @Delete('assignments/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async deleteAssignment(@Param('id') id: string) {
    await this.performanceService.deleteAssignment(id);
    return { message: 'Assignment deleted successfully' };
  }

  @Get('assignments/:id')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAssignmentById(@Param('id') id: string) {
    return this.performanceService.findAssignmentById(id);
  }

  @Get('assignments/:id/form')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getAssignmentWithTemplate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const managerId = req.user?.employeeId || req.user?.id;
    const userRoles = req.user?.roles || [];
    return this.performanceService.getAssignmentWithTemplate(id, managerId, userRoles);
  }

  // ========== APPRAISAL RECORD (MANAGER RATING) ENDPOINTS ==========

  @Post('assignments/:assignmentId/records')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createAppraisalRecord(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CreateAppraisalRecordDto,
    @Request() req: any,
  ) {
    const managerId = req.user?.employeeId || req.user?.id;
    const userRoles = req.user?.roles || [];
    return this.performanceService.createOrUpdateAppraisalRecord(assignmentId, managerId, dto, userRoles);
  }

  @Put('assignments/:assignmentId/records')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateAppraisalRecord(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAppraisalRecordDto,
    @Request() req: any,
  ) {
    const managerId = req.user?.employeeId || req.user?.id;
    const userRoles = req.user?.roles || [];
    return this.performanceService.createOrUpdateAppraisalRecord(assignmentId, managerId, dto, userRoles);
  }

  @Post('records/:recordId/submit')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async submitAppraisalRecord(
    @Param('recordId') recordId: string,
    @Request() req: any,
  ) {
    const managerId = req.user?.employeeId || req.user?.id;
    return this.performanceService.submitAppraisalRecord(recordId, managerId);
  }

  @Post('records/:recordId/publish')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async publishAppraisalRecord(
    @Param('recordId') recordId: string,
    @Request() req: any,
  ) {
    const hrEmployeeId = req.user?.employeeId || req.user?.id;
    return this.performanceService.publishAppraisalRecord(recordId, hrEmployeeId);
  }

  @Get('records/:id')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAppraisalRecordById(@Param('id') id: string) {
    return this.performanceService.findAppraisalRecordById(id);
  }

  @Get('records/employee/:employeeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAppraisalRecordsByEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.findAppraisalRecordsByEmployee(employeeId);
  }

  @Get('records/manager/:managerId')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findAppraisalRecordsByManager(@Param('managerId') managerId: string) {
    return this.performanceService.findAppraisalRecordsByManager(managerId);
  }

  @Get('records/:id/view')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async viewAppraisalRecord(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    const userRoles = req.user?.roles || [];
    return this.performanceService.viewAppraisalRecord(id, employeeId, userRoles);
  }

  @Post('records/:id/acknowledge')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async acknowledgeAppraisalRecord(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    return this.performanceService.acknowledgeAppraisalRecord(id, employeeId, body.comment);
  }

  // ========== DISPUTE ENDPOINTS ==========

  @Post('disputes')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async createDispute(
    @Body() dto: CreateDisputeDto,
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    return this.performanceService.createDispute(dto, employeeId);
  }

  @Get('disputes')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async findAllDisputes(@Query('status') status?: AppraisalDisputeStatus) {
    return this.performanceService.findAllDisputes(status);
  }

  @Get('disputes/:id')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async findDisputeById(@Param('id') id: string) {
    return this.performanceService.findDisputeById(id);
  }

  @Post('disputes/:id/resolve')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async resolveDispute(
    @Param('id') id: string,
    @Body() body: { dto: ResolveDisputeDto; action: 'approve' | 'reject' },
    @Request() req: any,
  ) {
    const hrManagerId = req.user?.employeeId || req.user?.id;
    return this.performanceService.resolveDispute(id, body.dto, hrManagerId, body.action);
  }

  // ========== DASHBOARD/MONITORING ENDPOINTS ==========

  @Get('cycles/:cycleId/assignments')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getAssignmentsByCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.getAssignmentsByCycle(cycleId);
  }

  @Get('records/employee/:employeeId/published')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async getPublishedAppraisalsForEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.getPublishedAppraisalsForEmployee(employeeId);
  }

  @Get('dashboard/department/:departmentId')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async getAppraisalProgressByDepartment(@Param('departmentId') departmentId: string) {
    return this.performanceService.getAppraisalProgressByDepartment(departmentId);
  }
}
