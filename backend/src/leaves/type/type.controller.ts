import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { LeaveTypeService } from './type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Controller('leave-types')
export class LeaveTypeController {
  constructor(private service: LeaveTypeService) {}

  @Get()
  findAll() {
    console.log('🔍 [LeaveTypeController] findAll');
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateLeaveTypeDto) {
    console.log('🔍 [LeaveTypeController] create:', dto);
    return this.service.create(dto);
  }

  // ==================== PARAMETRIC ROUTES ====================

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('🔍 [LeaveTypeController] findOne:', { id });
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    console.log('🔍 [LeaveTypeController] update:', { id, dto });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('🔍 [LeaveTypeController] remove:', { id });
    return this.service.remove(id);
  }
}
