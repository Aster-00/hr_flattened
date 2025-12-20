import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { OvertimeRuleService } from '../services/overtime-rule.service';
import { CreateOvertimeRuleDto } from '../dto/create-overtime-rule.dto';
import { UpdateOvertimeRuleDto } from '../dto/update-overtime-rule.dto';

@Controller('overtime-rules')
export class OvertimeRuleController {
  constructor(private readonly service: OvertimeRuleService) {}

  @Post()
  create(@Body() dto: CreateOvertimeRuleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOvertimeRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
