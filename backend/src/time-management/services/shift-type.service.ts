import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShiftTypeDocument } from '../Models/shift-type.schema';
import { CreateShiftTypeDto } from '../dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from '../dto/update-shift-type.dto';


/**
 * Creates a new shift type
 * @param {CreateShiftTypeDto} dto - Shift type creation data
 * @returns {Promise<ShiftTypeDocument>} - Created shift type
 */
@Injectable()
export class ShiftTypeService {
  constructor(
    @InjectModel('ShiftType')
    private readonly model: Model<ShiftTypeDocument>,
  ) {}

  async create(dto: CreateShiftTypeDto) {
    return this.model.create(dto);
  }

  async findAll() {
    return this.model.find({}).lean();
  }

  // ✅ REQUIRED for EDIT page
  async findById(id: string) {
    // 🔒 Hard guards (same pattern as ShiftService)
    if (!id || id === 'undefined') {
      throw new BadRequestException('Invalid shift type id');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shift type id');
    }

    const doc = await this.model.findById(id).lean();

    if (!doc) {
      throw new NotFoundException('Shift type not found');
    }

    return doc;
  }

  async update(id: string, dto: UpdateShiftTypeDto) {
    // 🔒 Same guards for update
    if (!id || id === 'undefined') {
      throw new BadRequestException('Invalid shift type id');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shift type id');
    }

    const doc = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    if (!doc) {
      throw new NotFoundException('Shift type not found');
    }

    return doc;
  }
}
