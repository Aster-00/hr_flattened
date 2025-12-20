import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { LeaveTypeService } from '../type/type.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { RequestsService } from '../requests/requests.service';
import { TrackingService } from '../tracking/tracking.service';

@Controller('leaves/hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
export class HrLeaveController {
  constructor(
    private leaveTypeService: LeaveTypeService,
    private entitlementService: EntitlementService,
    private requestsService: RequestsService,
    private trackingService: TrackingService,
  ) {}

  @Get('types')
  async getLeaveTypes() {
    const types = await this.leaveTypeService.findAll();
    return {
      success: true,
      data: types
    };
  }

  @Post('types')
  async createLeaveType(@Body() createDto: any) {
    const created = await this.leaveTypeService.create(createDto);
    return {
      success: true,
      message: 'Leave type created successfully',
      data: created
    };
  }

  @Put('types/:id')
  async updateLeaveType(@Param('id') id: string, @Body() updateDto: any) {
    const updated = await this.leaveTypeService.update(id, updateDto);
    return {
      success: true,
      message: 'Leave type updated successfully',
      data: updated
    };
  }

  @Delete('types/:id')
  async deactivateLeaveType(@Param('id') id: string) {
    await this.leaveTypeService.remove(id);
    return {
      success: true,
      message: 'Leave type deactivated'
    };
  }

  @Get('entitlements')
  async getEntitlements(@Query('employeeId') employeeId?: string) {
    const entitlements = await this.entitlementService.findAll(employeeId);
    return {
      success: true,
      data: entitlements
    };
  }

  @Post('entitlements')
  async assignEntitlement(@Body() dto: any) {
    const entitlement = await this.entitlementService.assignPersonalized(dto);
    return {
      success: true,
      message: 'Entitlement assigned successfully',
      data: entitlement
    };
  }

  @Get('balances')
  async getBalances(@Query('employeeId') employeeId?: string) {
    const balances = await this.trackingService.getMyCurrentBalances(
      { employeeId },
      employeeId
    );
    return {
      success: true,
      data: balances
    };
  }

  @Post('balances')
  async adjustBalance(@Body() dto: any) {
    const adjustment = await this.entitlementService.manualAdjustment(dto);
    return {
      success: true,
      message: 'Balance adjusted successfully',
      data: adjustment
    };
  }

  @Get('dashboard')
  async getDashboard() {
    // Get all pending requests
    const pendingRequests = await this.requestsService.findAll({ status: 'PENDING' });
    const approvedRequests = await this.requestsService.findAll({ status: 'APPROVED' });
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count employees on leave today
    const onLeaveToday = approvedRequests.filter((req: any) => {
      const from = new Date(req.dates?.from);
      const to = new Date(req.dates?.to);
      return from <= today && to >= today;
    }).length;

    return {
      success: true,
      data: {
        pendingApprovals: pendingRequests.length,
        onLeaveToday,
        totalRequests: pendingRequests.length + approvedRequests.length,
      }
    };
  }

  @Get('approvals')
  getPendingApprovals() {
    return {
      success: true,
      data: []
    };
  }
}
