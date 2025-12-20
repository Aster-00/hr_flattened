import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReportingService {
  constructor(
      @InjectModel('TimeException') private readonly exceptionModel: Model<any>,
      @InjectModel('AttendanceRecord') private readonly attendanceModel: Model<any>,
  ) {}

  // ================= Exceptions Summary =================
  async exceptionsSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);

    const breakdown = await this.exceptionModel.aggregate([
      { $match: q },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = breakdown.reduce((s, r) => s + r.count, 0);
    return { total, breakdown };
  }

  async exportExceptionsCsv(): Promise<string> {
    const data = await this.exceptionModel.find().lean();

    let csv = 'ExceptionID,EmployeeID,Status,Type,CreatedAt\n';
    for (const e of data) {
      csv += `${e._id},${e.employeeId},${e.status},${e.type},${e.createdAt}\n`;
    }
    return csv;
  }

  // ================= Overtime Summary =================
  async overtimeSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    return this.attendanceModel.aggregate([
      { $match: { ...q, overtimeMinutes: { $gt: 0 } } },
      {
        $group: {
          _id: '$employeeId',
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
        },
      },
    ]);
  }

  async exportOvertimeCsv(): Promise<string> {
    const data = await this.overtimeSummary();

    let csv = 'EmployeeID,TotalOvertimeMinutes\n';
    for (const r of data) {
      csv += `${r._id},${r.totalOvertimeMinutes}\n`;
    }
    return csv;
  }

  // ================= Lateness Summary =================
  async latenessSummary(from?: string, to?: string) {
    const q: any = {};
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    return this.attendanceModel.aggregate([
      { $match: q },
      {
        $group: {
          _id: '$employeeId',
          lateCount: {
            $sum: { $cond: ['$isLate', 1, 0] },
          },
        },
      },
    ]);
  }

  // ================= Dashboard KPIs =================
  async dashboardKpis() {
    const total = await this.exceptionModel.countDocuments();
    const approved = await this.exceptionModel.countDocuments({ status: 'APPROVED' });
    const rejected = await this.exceptionModel.countDocuments({ status: 'REJECTED' });
    const pending = await this.exceptionModel.countDocuments({ status: 'PENDING' });

    return {
      totalExceptions: total,
      approved,
      rejected,
      pending,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
    };
  }
}
