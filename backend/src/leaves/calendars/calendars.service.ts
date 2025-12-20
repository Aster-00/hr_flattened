// src/leaves/calendars/calendars.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Calendar } from '../Models/calendar.schema';
import { Holiday } from '../../time-management/Models/holiday.schema';

import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Injectable()
export class CalendarsService {
  constructor(
    @InjectModel(Calendar.name)
    private readonly calendarModel: Model<Calendar>,
    @InjectModel(Holiday.name)
    private readonly holidayModel: Model<Holiday>,
  ) {}

  create(dto: CreateCalendarDto) {
    return this.calendarModel.create(dto);
  }

  findAll() {
    return this.calendarModel.find().populate('holidays').exec();
  }

  findOne(id: string) {
    return this.calendarModel.findById(id).populate('holidays').exec();
  }

  async update(id: string, dto: UpdateCalendarDto) {
    const updated = await this.calendarModel
      .findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Calendar not found');
    return updated;
  }

  async delete(id: string) {
    return this.calendarModel.findByIdAndDelete(id);
  }

  async updateBlockedPeriod(id: string, dto: any) {
    return this.calendarModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  /**
   * Helper for RequestsService:
   * - Counts working days between from/to
   * - Returns holidays in that range
   * - Indicates if any blocked period overlaps
   */
  async analyzeDateRangeForEmployee(
    employeeCalendarId: string,
    from: Date,
    to: Date,
  ): Promise<{
    workingDays: number;
    holidays: { date: Date; name: string }[];
    overlapsBlockedPeriod: boolean;
  }> {
    const calendar = await this.calendarModel
      .findById(employeeCalendarId)
      .lean()
      .exec();

    if (!calendar) {
      throw new NotFoundException('Calendar not found for employee');
    }

    // Example assumptions – adjust to your schema:
    // calendar.weekendDays: number[] (0=Sunday..6=Saturday)
    // calendar.blockedPeriods: { from: Date; to: Date; reason?: string }[]
    // calendar.country or calendar.code used to match holidays

    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Fetch holidays for this calendar/country in range
    const holidaysDocs = await this.holidayModel
      .find({
        date: { $gte: start, $lte: end },
        calendarId: calendar._id, // or country/code, adjust as needed
      })
      .lean()
      .exec();

    const holidays = holidaysDocs.map((h: any) => ({
      date: h.date,
      name: h.name,
    }));

    // Check blocked periods overlap
    const blockedPeriods: { from: Date; to: Date }[] =
      (calendar as any).blockedPeriods ?? [];

    const overlapsBlockedPeriod = blockedPeriods.some((bp) => {
      const bpFrom = new Date(bp.from);
      const bpTo = new Date(bp.to);
      return bpFrom <= end && bpTo >= start;
    });

    // Count working days (exclude weekends + holidays)
    const weekendDays: number[] = (calendar as any).weekendDays ?? [5, 6]; // Fri/Sat default example
    const holidayDates = new Set(
      holidays.map((h) => new Date(h.date).toDateString()),
    );

    let workingDays = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.getDay(); // 0..6
      const key = cursor.toDateString();

      const isWeekend = weekendDays.includes(day);
      const isHoliday = holidayDates.has(key);

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      workingDays,
      holidays,
      overlapsBlockedPeriod,
    };
  }

  /**
   * REQ-005: Calculate working days between two dates
   */
  async calculateWorkingDays(from: string, to: string) {
    // Get default calendar or first calendar
    const calendar = await this.calendarModel.findOne().lean().exec();
    
    if (!calendar) {
      throw new NotFoundException('No calendar found');
    }

    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Fetch holidays in range
    const holidaysDocs = await this.holidayModel
      .find({
        date: { $gte: start, $lte: end },
      })
      .lean()
      .exec();

    const holidays = holidaysDocs.map((h: any) => ({
      date: h.date,
      name: h.name,
    }));

    // Count working days
    const weekendDays: number[] = (calendar as any).weekendDays ?? [5, 6];
    const holidayDates = new Set(
      holidays.map((h) => new Date(h.date).toDateString()),
    );

    let workingDays = 0;
    const excludedDates: { date: string; reason: string }[] = [];
    const cursor = new Date(start);
    
    while (cursor <= end) {
      const day = cursor.getDay();
      const key = cursor.toDateString();

      const isWeekend = weekendDays.includes(day);
      const isHoliday = holidayDates.has(key);

      if (isWeekend || isHoliday) {
        excludedDates.push({
          date: cursor.toISOString().split('T')[0],
          reason: isHoliday 
            ? holidays.find(h => new Date(h.date).toDateString() === key)?.name || 'Holiday'
            : 'Weekend',
        });
      } else {
        workingDays++;
      }
      
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      workingDays,
      totalDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      excludedDates,
      from,
      to,
    };
  }

  /**
   * REQ-008: Check for blocked periods
   */
  async checkBlockedPeriods(from: string, to: string) {
    const calendar = await this.calendarModel.findOne().lean().exec();
    
    if (!calendar) {
      return {
        hasBlockedPeriod: false,
        blockedPeriods: [],
      };
    }

    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const blockedPeriods: any[] = (calendar as any).blockedPeriods ?? [];
    
    const overlapping = blockedPeriods.filter((bp) => {
      const bpFrom = new Date(bp.from);
      const bpTo = new Date(bp.to);
      bpFrom.setHours(0, 0, 0, 0);
      bpTo.setHours(0, 0, 0, 0);
      return bpFrom <= end && bpTo >= start;
    });

    return {
      hasBlockedPeriod: overlapping.length > 0,
      blockedPeriods: overlapping.map(bp => ({
        name: bp.name || 'Blocked Period',
        from: bp.from,
        to: bp.to,
        reason: bp.reason,
      })),
    };
  }

  /**
   * REQ-010: Get all blocked periods
   */
  async getBlockedPeriods() {
    const calendar = await this.calendarModel.findOne().lean().exec();

    if (!calendar) {
      return [];
    }

    const blockedPeriods: any[] = (calendar as any).blockedPeriods ?? [];
    return blockedPeriods.map((bp, index) => ({
      _id: bp._id || `bp-${index}`,
      name: bp.name || 'Blocked Period',
      startDate: bp.from,
      endDate: bp.to,
      from: bp.from, // Keep for backward compatibility
      to: bp.to, // Keep for backward compatibility
      reason: bp.reason,
    }));
  }

  /**
   * REQ-010: Create blocked period
   */
  async createBlockedPeriod(dto: { name: string; from?: string; to?: string; startDate?: string; endDate?: string; reason?: string }) {
    const calendar = await this.calendarModel.findOne().exec();

    if (!calendar) {
      throw new NotFoundException('No calendar found');
    }

    // Accept both from/to and startDate/endDate
    const fromDate = dto.from || dto.startDate;
    const toDate = dto.to || dto.endDate;

    if (!fromDate || !toDate) {
      throw new Error('Start date and end date are required');
    }

    const blockedPeriods: any[] = (calendar as any).blockedPeriods ?? [];
    const newPeriod = {
      _id: new Date().getTime().toString(),
      name: dto.name,
      from: new Date(fromDate),
      to: new Date(toDate),
      reason: dto.reason,
    };

    blockedPeriods.push(newPeriod);
    (calendar as any).blockedPeriods = blockedPeriods;

    await calendar.save();

    // Return with both field name formats
    return {
      _id: newPeriod._id,
      name: newPeriod.name,
      startDate: newPeriod.from,
      endDate: newPeriod.to,
      from: newPeriod.from,
      to: newPeriod.to,
      reason: newPeriod.reason,
    };
  }

  /**
   * REQ-010: Delete blocked period
   */
  async deleteBlockedPeriod(id: string) {
    const calendar = await this.calendarModel.findOne().exec();

    if (!calendar) {
      throw new NotFoundException('No calendar found');
    }

    const blockedPeriods: any[] = (calendar as any).blockedPeriods ?? [];
    const filtered = blockedPeriods.filter((bp) => bp._id?.toString() !== id);

    (calendar as any).blockedPeriods = filtered;
    await calendar.save();

    return { message: 'Blocked period deleted successfully' };
  }

  /**
   * Add holiday to calendar
   */
  async addHoliday(calendarId: string, dto: { date: string; name: string; description?: string }) {
    const calendar = await this.calendarModel.findById(calendarId).exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar ${calendarId} not found`);
    }

    // Create holiday in Holiday collection using the actual schema fields
    const holiday = await this.holidayModel.create({
      type: 'NATIONAL', // Default to national holiday
      startDate: new Date(dto.date),
      endDate: new Date(dto.date), // Single day holiday
      name: dto.name,
      active: true,
    });

    // Add reference to calendar
    (calendar as any).holidays.push(holiday._id);
    await calendar.save();

    return {
      _id: holiday._id,
      date: holiday.startDate,
      name: holiday.name,
      description: dto.description, // Keep description in response even if not in schema
    };
  }

  /**
   * Delete holiday from calendar
   */
  async deleteHoliday(calendarId: string, holidayId: string) {
    const calendar = await this.calendarModel.findById(calendarId).exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar ${calendarId} not found`);
    }

    // Delete from Holiday collection
    await this.holidayModel.findByIdAndDelete(holidayId).exec();

    // Remove reference from calendar
    (calendar as any).holidays = (calendar as any).holidays.filter(
      (id: any) => id.toString() !== holidayId
    );
    await calendar.save();

    return { message: 'Holiday deleted successfully' };
  }
}
