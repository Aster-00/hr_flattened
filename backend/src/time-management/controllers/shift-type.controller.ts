import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateShiftTypeDto } from '../dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from '../dto/update-shift-type.dto';
import { ShiftTypeService } from '../services/shift-type.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shift-types')
export class ShiftTypeController {
  constructor(private readonly svc: ShiftTypeService) {}

  // Only HR Manager, HR Admin, System Admin can create shift types

     @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.SYSTEM_ADMIN
  )
  @Post()
  create(@Body() dto: CreateShiftTypeDto) {
    return this.svc.create(dto);
  }

  // Everyone with visibility in the module can view shift types
 
     @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.DEPARTMENT_HEAD,
        SystemRole.SYSTEM_ADMIN
  )
  @Get()
  findAll() {
    return this.svc.findAll();
  }
@Roles(
  SystemRole.HR_ADMIN,
  SystemRole.HR_MANAGER,
  SystemRole.DEPARTMENT_EMPLOYEE,
  SystemRole.DEPARTMENT_HEAD,
  SystemRole.SYSTEM_ADMIN
)
@Get(':id')
findOne(@Param('id') id: string) {
  return this.svc.findById(id);
}

  // Only HR Manager, HR Admin, System Admin can update shift types

     @Roles(SystemRole.HR_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.SYSTEM_ADMIN
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftTypeDto) {
    return this.svc.update(id, dto);
  }
}
