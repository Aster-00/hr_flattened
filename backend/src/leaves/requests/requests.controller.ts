import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { FinalizeRequestDto } from './dto/finalize-request.dto';
import { ReturnForCorrectionDto } from './dto/return-for-correction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveRequest } from '../Models/leave-request.schema';

// Auth + roles
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequest>,
  ) {}

  // ==================== SPECIFIC ROUTES (MUST COME FIRST) ====================

  // REQ-027: bulk processing (manager / HR)
  @Post('bulk-process')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  bulkProcess(
    @Body()
    payload: {
      requestIds: string[];
      action: 'approve' | 'reject';
    },
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] bulkProcess:', { 
      requestIds: payload.requestIds, 
      action: payload.action 
    });
    const approverId = req.user._id || req.user.id;
    const { requestIds, action } = payload;
    return this.requestsService.bulkProcessRequests(
      requestIds,
      action,
      approverId,
    );
  }

  // Submit post-leave (backdated) request
  @Post('post-leave')
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
  async submitPostLeave(@Body() dto: CreateRequestDto, @Req() req: any) {
    console.log('🔍 [RequestsController] submitPostLeave:', { 
      dto, 
      userId: req.user._id || req.user.id 
    });
    
    const fromDate = new Date(dto.fromDate);
    const daysSince = Math.floor((Date.now() - fromDate.getTime()) / 86400000);
    
    if (daysSince > 7) {
      throw new BadRequestException(
        'Post-leave requests must be within 7 days of leave start'
      );
    }

    const userId = req.user._id || req.user.id;
    const data: any = { 
      ...dto, 
      employeeId: userId,
      isPostLeave: true, 
      postLeaveSubmittedAt: new Date() 
    };
    return this.requestsService.submitRequest(data);
  }

  // Check post-leave eligibility
  @Get('post-leave-eligible')
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
  async checkPostLeaveEligibility(@Query('fromDate') fromDate: string) {
    console.log('🔍 [RequestsController] checkPostLeaveEligibility:', { fromDate });
    
    if (!fromDate) {
      throw new BadRequestException('fromDate query parameter is required');
    }
    
    const leaveStart = new Date(fromDate);
    const daysSince = Math.floor((Date.now() - leaveStart.getTime()) / 86400000);
    const daysRemaining = Math.max(0, 7 - daysSince);

    return { 
      eligible: daysSince <= 7, 
      daysRemaining, 
      maxDays: 7,
      daysSinceLeaveStart: daysSince
    };
  }

  // Get overdue requests (pending > 48 hours)
  @Get('overdue')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async getOverdueRequests(@Query('departmentId') departmentId?: string) {
    console.log('🔍 [RequestsController] getOverdueRequests:', { departmentId });
    
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    const query: any = { 
      status: 'pending', 
      createdAt: { $lt: cutoff } 
    };
    
    // ✅ FIX: Proper population
    const requests = await this.leaveRequestModel
      .find(query)
      .populate('employeeId', 'firstName lastName email primaryDepartmentId employeeNumber')
      .populate('leaveTypeId', 'name code color')
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    // ✅ FIX: Filter null employees and apply department filter
    let filtered = requests.filter(r => r.employeeId !== null);
    
    if (departmentId) {
      filtered = filtered.filter(r => 
        (r.employeeId as any)?.primaryDepartmentId?.toString() === departmentId
      );
    }

    const now = new Date();
    return {
      total: filtered.length,
      requests: filtered.map(r => ({
        ...r,
        hoursElapsed: Math.floor((now.getTime() - (r as any).createdAt.getTime()) / 3600000)
      }))
    };
  }

  // REQ-006: Check for overlapping requests
  @Get('check-overlap')
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
  async checkOverlap(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('excludeId') excludeId?: string,
    @Req() req?,
  ) {
    console.log('🔍 [RequestsController] checkOverlap:', { from, to, excludeId });
    const userId = req?.user?._id || req?.user?.id;
    return this.requestsService.checkOverlappingRequests(
      userId,
      from,
      to,
      excludeId,
    );
  }

  // GET employee's own requests
  @Get('me')
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
  getMyRequests(@Req() req: any) {
    console.log('🔍 [RequestsController] getMyRequests:', { 
      employeeId: req.user._id || req.user.id 
    });
    const employeeId = req.user._id || req.user.id;
    return this.requestsService.getMyRequests(employeeId);
  }

  // GET team requests (Manager only)
  @Get('team')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
  )
  getTeamRequests(@Req() req) {
    console.log('🔍 [RequestsController] getTeamRequests:', { 
      managerId: req.user._id || req.user.id 
    });
    const managerId = req.user._id || req.user.id;
    return this.requestsService.getTeamRequests(managerId);
  }

  // ✅ FIX: GET all leave requests (HR only) - WITH POPULATION
  @Get()
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async getAllRequests() {
    console.log('🔍 [RequestsController] getAllRequests');
    
    // ✅ Call service method which should handle population
    const requests = await this.requestsService.getAllRequests();
    
    // ✅ Filter out any requests with null employeeId (orphaned data)
    const validRequests = requests.filter((r: any) => r.employeeId !== null);
    
    if (validRequests.length < requests.length) {
      console.warn(
        `⚠️ [RequestsController] Filtered out ${requests.length - validRequests.length} orphaned requests`
      );
    }
    
    console.log(`✅ [RequestsController] Returning ${validRequests.length} valid requests`);
    return validRequests;
  }

  // REQ-015/016/031: submit new leave request (employee)
  @Post()
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
  create(@Body() dto: CreateRequestDto, @Req() req) {
    console.log('🔍 [RequestsController] create - User:', { 
      id: req.user._id || req.user.id,
      roles: req.user.roles 
    });
    console.log('🔍 [RequestsController] create - DTO:', dto);
    
    // ✅ FIX: Consistent user ID extraction
    const userId = req.user._id || req.user.id;
    console.log('🔍 [RequestsController] Using userId:', userId);
    
    // Force owner from JWT, ignore any employeeId in body
    return this.requestsService.submitRequest({
      ...dto,
      employeeId: userId,
    });
  }

  // ==================== PARAMETRIC ROUTES (MUST COME LAST) ====================

  // REQ-018: cancel pending/approved request (same employee)
  @Delete(':id/cancel')
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
  cancel(@Param('id') id: string, @Req() req) {
    const userId = req.user._id || req.user.id;
    console.log('🔍 [RequestsController] cancel:', { id, userId });
    return this.requestsService.cancelRequest(id, userId);
  }

  // REQ-028: HR verify medical documents
  @Get(':id/verify-medical')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  verifyMedical(@Param('id') id: string) {
    console.log('🔍 [RequestsController] verifyMedical:', { id });
    return this.requestsService.verifyMedicalDocuments(id);
  }

  // Verify document attachment (medical certificate, etc.)
  @Post(':id/verify-document')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async verifyDocument(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { verified: boolean; comments?: string }
  ) {
    console.log('🔍 [RequestsController] verifyDocument:', { 
      id, 
      verified: body.verified, 
      userId: req.user._id || req.user.id 
    });
    
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    if (!request.attachmentId) {
      throw new BadRequestException('No document attached to this request');
    }

    const userId = req.user._id || req.user.id;
    
    // ✅ FIX: Use type assertion for extended fields
    (request as any).documentVerified = body.verified;
    (request as any).documentVerifiedBy = userId;
    (request as any).documentVerifiedAt = new Date();
    
    await request.save();
    return request;
  }

  @Get(':id/integration-details')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  getIntegrationDetails(@Param('id') id: string) {
    console.log('🔍 [RequestsController] getIntegrationDetails:', { id });
    return this.requestsService.getFinalizedLeaveDetails(id);
  }

  // REQ-020/021: manager approve
  @Post(':id/manager-approve')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  managerApprove(
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] managerApprove:', {
      id,
      dto,
      approverId: req.user._id || req.user.id
    });
    const approverId = req.user._id || req.user.id;
    return this.requestsService.managerApprove(id, {
      ...dto,
      approverId,
    });
  }

  // REQ-020/022: manager reject
  @Post(':id/manager-reject')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  managerReject(
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] managerReject:', { 
      id, 
      dto, 
      approverId: req.user._id || req.user.id 
    });
    const approverId = req.user._id || req.user.id;
    return this.requestsService.managerReject(id, {
      ...dto,
      approverId,
    });
  }

  // REQ-024: Manager/HR returns request for correction
  @Post(':id/return-for-correction')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  returnForCorrection(
    @Param('id') id: string,
    @Body() body: { reason: string; comment?: string },
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] returnForCorrection:', { 
      id, 
      body, 
      returnerId: req.user._id || req.user.id 
    });
    const returnerId = req.user._id || req.user.id;
    const dto: ReturnForCorrectionDto = {
      returnerId,
      reason: body.reason,
      comment: body.comment,
    };
    return this.requestsService.returnForCorrection(id, dto);
  }

  // REQ-024: Employee resubmits after corrections
  @Post(':id/resubmit')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
    SystemRole.FINANCE_STAFF,
  )
  resubmit(@Param('id') id: string, @Req() req) {
    console.log('🔍 [RequestsController] resubmit:', { 
      id, 
      employeeId: req.user._id || req.user.id 
    });
    const employeeId = req.user._id || req.user.id;
    return this.requestsService.resubmitReturnedRequest(id, employeeId);
  }

  // REQ-025/029/030/042: HR finalize
  @Post(':id/hr-finalize')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  hrFinalize(
    @Param('id') id: string,
    @Body() dto: FinalizeRequestDto,
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] hrFinalize:', { 
      id, 
      dto, 
      hrUserId: req.user._id || req.user.id 
    });
    const hrUserId = req.user._id || req.user.id;
    return this.requestsService.hrFinalize(id, {
      ...dto,
      hrUserId,
    });
  }

  // REQ-026: HR override manager decision
  @Post(':id/hr-override')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  hrOverride(
    @Param('id') id: string,
    @Body() dto: FinalizeRequestDto,
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] hrOverride:', { 
      id, 
      dto, 
      hrUserId: req.user._id || req.user.id 
    });
    const hrUserId = req.user._id || req.user.id;
    return this.requestsService.hrOverride(id, {
      ...dto,
      hrUserId,
    });
  }

  // REQ-017: modify pending request (same employee)
  @Patch(':id')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.RECRUITER,
    SystemRole.FINANCE_STAFF,
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
    @Req() req,
  ) {
    console.log('🔍 [RequestsController] update:', { 
      id, 
      dto, 
      userId: req.user._id || req.user.id 
    });
    const userId = req.user._id || req.user.id;
    return this.requestsService.updateRequestAsOwner(id, dto, userId);
  }
}
