// src/leaves/escalation/escalation.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { EscalationService } from './escalation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Controller('leaves/escalation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EscalationController {
  constructor(private readonly escalationService: EscalationService) {}

  @Post('run-pending-escalation')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  runPendingEscalation() {
    return this.escalationService.runPendingEscalationJob();
  }
}
