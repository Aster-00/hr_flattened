import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OffboardingService } from './offboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Controller('offboarding')
// @UseGuards(JwtAuthGuard, RolesGuard) // TEMPORARILY DISABLED FOR TESTING
export class OffboardingController {
  constructor(private offboardingService: OffboardingService) { }

  // ===== Offboarding Request Endpoints =====

  @Post('request')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async createOffboardingRequest(@Body() data: any) {
    return await this.offboardingService.createOffboardingRequest(data);
  }

  @Get('request/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getOffboardingRequest(@Param('id') id: string) {
    return await this.offboardingService.getOffboardingRequest(id);
  }

  @Get('request')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getAllOffboardingRequests(@Query() filters?: any) {
    return await this.offboardingService.getAllOffboardingRequests(filters);
  }

  @Get('request/employee/:employeeId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getOffboardingRequestsByEmployee(@Param('employeeId') employeeId: string) {
    return await this.offboardingService.getOffboardingRequestsByEmployee(employeeId);
  }

  @Put('request/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async updateOffboardingRequest(@Param('id') id: string, @Body() data: any) {
    return await this.offboardingService.updateOffboardingRequest(id, data);
  }

  @Delete('request/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async deleteOffboardingRequest(@Param('id') id: string) {
    return await this.offboardingService.deleteOffboardingRequest(id);
  }

  // ===== Offboarding Status Endpoints =====

  @Post('status/:offboardingRequestId/:employeeId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async createOffboardingStatus(
    @Param('offboardingRequestId') offboardingRequestId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return await this.offboardingService.createOffboardingStatus(offboardingRequestId, employeeId);
  }

  @Get('status/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getOffboardingStatus(@Param('id') id: string) {
    return await this.offboardingService.getOffboardingStatus(id);
  }

  @Put('status/:offboardingRequestId/stage/:stage')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async updateOffboardingStage(
    @Param('offboardingRequestId') offboardingRequestId: string,
    @Param('stage') stage: string,
  ) {
    return await this.offboardingService.updateOffboardingStage(offboardingRequestId, stage as any);
  }

  @Put('status/:offboardingRequestId/complete-stage')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async completeOffboardingStage(@Param('offboardingRequestId') offboardingRequestId: string) {
    return await this.offboardingService.completeOffboardingStage(offboardingRequestId);
  }

  // ===== Exit Interview Endpoints =====

  @Post('exit-interview/:offboardingRequestId/:employeeId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async createExitInterview(
    @Param('offboardingRequestId') offboardingRequestId: string,
    @Param('employeeId') employeeId: string,
    @Body() data: any,
  ) {
    return await this.offboardingService.createExitInterview(offboardingRequestId, employeeId, data);
  }

  @Get('exit-interview/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getExitInterview(@Param('id') id: string) {
    return await this.offboardingService.getExitInterview(id);
  }

  @Get('exit-interview/offboarding/:offboardingRequestId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getExitInterviewByOffboarding(@Param('offboardingRequestId') offboardingRequestId: string) {
    return await this.offboardingService.getExitInterviewByOffboarding(offboardingRequestId);
  }

  @Put('exit-interview/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async updateExitInterview(@Param('id') id: string, @Body() data: any) {
    return await this.offboardingService.updateExitInterview(id, data);
  }

  @Put('exit-interview/:id/complete')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async completeExitInterview(@Param('id') id: string) {
    return await this.offboardingService.completeExitInterview(id);
  }

  // ===== Asset Return Endpoints =====

  @Post('asset/:offboardingRequestId/:employeeId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createAssetReturn(
    @Param('offboardingRequestId') offboardingRequestId: string,
    @Param('employeeId') employeeId: string,
    @Body() assetData: any,
  ) {
    return await this.offboardingService.createAssetReturn(offboardingRequestId, employeeId, assetData);
  }

  @Get('asset/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAssetReturn(@Param('id') id: string) {
    return await this.offboardingService.getAssetReturn(id);
  }

  @Get('asset/offboarding/:offboardingRequestId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAssetsByOffboarding(@Param('offboardingRequestId') offboardingRequestId: string) {
    return await this.offboardingService.getAssetsByOffboarding(offboardingRequestId);
  }

  @Put('asset/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async updateAssetReturn(@Param('id') id: string, @Body() data: any) {
    return await this.offboardingService.updateAssetReturn(id, data);
  }

  @Put('asset/:id/mark-returned/:receivedByPersonId/:condition')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async markAssetAsReturned(
    @Param('id') id: string,
    @Param('receivedByPersonId') receivedByPersonId: string,
    @Param('condition') condition: string,
  ) {
    return await this.offboardingService.markAssetAsReturned(id, receivedByPersonId, condition);
  }

  @Delete('asset/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async deleteAssetReturn(@Param('id') id: string) {
    return await this.offboardingService.deleteAssetReturn(id);
  }

  // ===== Final Settlement Endpoints =====

  @Post('settlement/:offboardingRequestId/:employeeId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER)
  async createFinalSettlement(
    @Param('offboardingRequestId') offboardingRequestId: string,
    @Param('employeeId') employeeId: string,
    @Body() data: any,
  ) {
    return await this.offboardingService.createFinalSettlement(offboardingRequestId, employeeId, data);
  }

  @Get('settlement/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER)
  async getFinalSettlement(@Param('id') id: string) {
    return await this.offboardingService.getFinalSettlement(id);
  }

  @Get('settlement/offboarding/:offboardingRequestId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER)
  async getFinalSettlementByOffboarding(@Param('offboardingRequestId') offboardingRequestId: string) {
    return await this.offboardingService.getFinalSettlementByOffboarding(offboardingRequestId);
  }

  @Put('settlement/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER)
  async updateFinalSettlement(@Param('id') id: string, @Body() data: any) {
    return await this.offboardingService.updateFinalSettlement(id, data);
  }

  @Put('settlement/:id/process/:processedByPersonId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_MANAGER)
  async processFinalSettlement(
    @Param('id') id: string,
    @Param('processedByPersonId') processedByPersonId: string,
    @Body() paymentData: any,
  ) {
    return await this.offboardingService.processFinalSettlement(id, paymentData, processedByPersonId);
  }

  @Put('settlement/:id/acknowledge')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_EMPLOYEE)
  async acknowledgeSettlement(@Param('id') id: string) {
    return await this.offboardingService.acknowledgeSettlement(id);
  }

  // ===== Clearance Checklist Endpoints =====

  @Get('clearance/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getClearanceChecklist(@Param('id') id: string) {
    return await this.offboardingService.getClearanceChecklist(id);
  }

  @Get('clearance/offboarding/:offboardingRequestId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getClearanceChecklistByOffboarding(@Param('offboardingRequestId') offboardingRequestId: string) {
    return await this.offboardingService.getClearanceChecklistByOffboarding(offboardingRequestId);
  }

  @Put('clearance/offboarding/:offboardingRequestId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async updateClearanceChecklistByOffboarding(
    @Param('offboardingRequestId') offboardingRequestId: string,
    @Body() data: any,
  ) {
    return await this.offboardingService.updateClearanceChecklistByOffboarding(offboardingRequestId, data);
  }

  // ===== Dashboard & Metrics Endpoints =====

  @Get('pipeline')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getOffboardingPipeline(@Query('employeeId') employeeId?: string) {
    return await this.offboardingService.getOffboardingPipeline(employeeId);
  }

  @Get('metrics')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getOffboardingMetrics() {
    return await this.offboardingService.getOffboardingMetrics();
  }

  @Get('progress/:offboardingRequestId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getOffboardingProgress(@Param('offboardingRequestId') offboardingRequestId: string) {
    return await this.offboardingService.getOffboardingProgress(offboardingRequestId);
  }
}
