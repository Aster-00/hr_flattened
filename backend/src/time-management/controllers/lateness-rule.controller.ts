import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LatenessRuleService } from '../services/lateness-rule.service';
import { CreateLatenessRuleDto } from '../dto/create-lateness-rule.dto';
import { UpdateLatenessRuleDto } from '../dto/update-lateness-rule.dto';

@Controller('lateness-rules')
export class LatenessRuleController {
  constructor(private readonly service: LatenessRuleService) {}

  @Post()
  create(@Body() dto: CreateLatenessRuleDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateLatenessRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
