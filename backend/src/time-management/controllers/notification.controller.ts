import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import { NotificationService } from '../services/notification.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
      private readonly notificationService: NotificationService,
  ) {}

  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Get()
  async getMyNotifications(@Req() req) {
    return this.notificationService.findForEmployee(
        req.user.id.toString(),
    );
  }

  @Roles(
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.SYSTEM_ADMIN,
  )
  @Patch(':id/read')
  async markAsRead(
      @Param('id') id: string,
      @Req() req,
  ) {
    return this.notificationService.markAsRead(
        id,
        req.user.id.toString(),
    );
  }
}
