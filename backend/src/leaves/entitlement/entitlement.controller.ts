// src/leaves/entitlement/entitlement.controller.ts
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import { CreateEntitlementDto } from './dto/create-entitlement.dto';
import { UpdateEntitlementDto } from './dto/update-entitlement.dto';
import { PersonalizedEntitlementDto } from './dto/personalized-entitlement.dto';

// auth + roles (adjust paths)
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/entitlements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntitlementController {
  constructor(private readonly service: EntitlementService) {}

  // ==================== SPECIFIC ROUTES ====================

  // HR/System only: assign personalized entitlements (REQ-008)
  @Post('assign')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  assign(@Body() dto: PersonalizedEntitlementDto) {
    console.log('🔍 [EntitlementController] assign:', dto);
    return this.service.assignPersonalized(dto);
  }

  // HR/System only: bulk assign entitlements to multiple employees
  @Post('bulk-assign')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async bulkAssign(@Body() dto: { assignments: PersonalizedEntitlementDto[] }) {
    console.log('🔍 [EntitlementController] bulkAssign:', dto);
    const results = await Promise.all(
      dto.assignments.map(assignment => this.service.assignPersonalized(assignment))
    );
    return { success: true, count: results.length, results };
  }

  // REQ-013: HR manual balance adjustment with audit trail
  @Post('manual-adjustment')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  manualAdjustment(
    @Body() dto: { employeeId: string; leaveTypeId: string; amount: number; adjustmentType: string; reason: string; hrUserId: string },
  ) {
    console.log('🔍 [EntitlementController] manualAdjustment:', dto);
    return this.service.manualAdjustment(dto);
  }

  // HR/System only: create base entitlements
  @Post()
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  create(@Body() dto: CreateEntitlementDto) {
    console.log('🔍 [EntitlementController] create:', dto);
    return this.service.create(dto);
  }

  // ==================== PARAMETRIC ROUTES ====================

  // HR/System only: update entitlement numbers (used for manual corrections / carry-over)
  @Patch(':id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  update(@Param('id') id: string, @Body() dto: UpdateEntitlementDto) {
    console.log('🔍 [EntitlementController] update:', { id, dto });
    return this.service.update(id, dto);
  }
}
