import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getAuditLogs(@Query() query: QueryAuditLogsDto) {
    console.log('📋 Fetching audit logs with filters:', query);
    
    const filters: any = {};
    if (query.userId) filters.userId = query.userId;
    if (query.entityType) filters.entityType = query.entityType;
    if (query.entityId) filters.entityId = query.entityId;
    if (query.action) filters.action = query.action;
    if (query.startDate || query.endDate) {
      filters.createdAt = {};
      if (query.startDate) filters.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filters.createdAt.$lte = new Date(query.endDate);
    }

    return this.auditService.findAll(filters);
  }

  @Get('entitlement/:entitlementId')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD)
  async getEntitlementHistory(@Param('entitlementId') entitlementId: string) {
    console.log('📜 Fetching entitlement history for:', entitlementId);
    return this.auditService.findByEntity('LeaveEntitlement', entitlementId);
  }
}
