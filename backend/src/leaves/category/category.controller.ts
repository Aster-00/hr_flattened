import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveCategory } from '../Models/leave-category.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@Controller('leave-categories')
@UseGuards(JwtAuthGuard)
export class LeaveCategoryController {
  constructor(
    @InjectModel(LeaveCategory.name)
    private categoryModel: Model<LeaveCategory>,
  ) {}

  @Get()
  async findAll() {
    return this.categoryModel.find().exec();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryModel.findById(id).exec();
  }

  @Post()
  async create(@Body() createDto: any) {
    const category = new this.categoryModel(createDto);
    return category.save();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.categoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
