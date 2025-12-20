import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { payrollRuns } from './Models/payrollRuns.schema';
import { paySlip } from './Models/payslip.schema';
import { PayRollStatus, PayRollPaymentStatus, PaySlipPaymentStatus, BonusStatus, BenefitStatus } from './enums/payroll-execution-enum';
import { EmployeeProfile } from '../employee-profile/Models/employee-profile.schema';
import { employeeSigningBonus } from './Models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation } from './Models/EmployeeTerminationResignation.schema';
import { employeePenalties } from './Models/employeePenalties.schema';
import { InitiatePeriodDto } from './dto/initiate-period.dto';
import { EditPeriodDto } from './dto/edit-period.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';
import { taxRules } from '../payroll-configuration/Models/taxRules.schema';
import { insuranceBrackets } from '../payroll-configuration/Models/insuranceBrackets.schema';
import { signingBonus } from '../payroll-configuration/Models/SigningBonus.schema';
import { terminationAndResignationBenefits } from '../payroll-configuration/Models/terminationAndResignationBenefits';
import { allowance } from '../payroll-configuration/Models/allowance.schema';
import { refunds } from '../payroll-tracking/Models/refunds.schema';
import { ConfigStatus } from '../payroll-configuration/enums/payroll-configuration-enums';
import { RefundStatus } from '../payroll-tracking/enums/payroll-tracking-enum';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { payGrade } from '../payroll-configuration/Models/payGrades.schema';
import { Department } from '../organization-structure/Models/department.schema';
import { LeaveRequest } from '../leaves/Models/leave-request.schema';
import { LeaveType } from '../leaves/Models/leave-type.schema';
import { LeaveStatus } from '../leaves/enums/leave-status.enum';

@Injectable()
export class PayrollExecutionService {
    private readonly logger = new Logger(PayrollExecutionService.name);
    // In-memory tracking for resolved anomalies (payslipId -> resolution notes)
    private resolvedAnomalies: Map<string, { resolvedAt: Date; notes: string }> = new Map();

    // Egyptian minimum wage (as of 2024)
    private readonly MINIMUM_WAGE = 6000;

    // In-memory audit log for manual adjustments
    private auditLog: Array<{
        timestamp: Date;
        action: string;
        entityType: string;
        entityId: string;
        userId?: string;
        changes: Record<string, any>;
    }> = [];



    constructor(
        @InjectModel(employeeSigningBonus.name)
        private readonly signingBonusModel: Model<employeeSigningBonus>,

        @InjectModel(EmployeeTerminationResignation.name)
        private readonly benefitModel: Model<EmployeeTerminationResignation>,

        @InjectModel(employeePenalties.name)
        private readonly penaltyModel: Model<employeePenalties>,

        @InjectModel(payrollRuns.name)
        private readonly payrollRunsModel: Model<payrollRuns>,

        @InjectModel(paySlip.name)
        private readonly paySlipModel: Model<paySlip>,

        @InjectModel(EmployeeProfile.name)
        private readonly employeeModel: Model<EmployeeProfile>,

        @InjectModel(taxRules.name)
        private readonly taxRulesModel: Model<taxRules>,

        @InjectModel(insuranceBrackets.name)
        private readonly insuranceModel: Model<insuranceBrackets>,

        @InjectModel(allowance.name)
        private readonly allowanceModel: Model<allowance>,

        @InjectModel(Department.name)
        private readonly departmentModel: Model<Department>,

        @InjectModel(refunds.name)
        private readonly refundsModel: Model<refunds>,

        @InjectModel(LeaveRequest.name)
        private readonly leaveRequestModel: Model<LeaveRequest>,

        @InjectModel(LeaveType.name)
        private readonly leaveTypeModel: Model<LeaveType>,
    ) { }

    // -----------------------
    // PHASE 0 - Pre-run review
    // -----------------------

    async getPendingItems() {
        const pendingBonuses = await this.signingBonusModel.find({ status: BonusStatus.PENDING }).lean();
        const pendingBenefits = await this.benefitModel.find({ status: BenefitStatus.PENDING }).lean();

        return { pendingBonuses, pendingBenefits };
    }

    async updateSigningBonusStatus(bonusRecordId: string, status: BonusStatus) {
        const bonus = await this.signingBonusModel.findById(bonusRecordId);
        if (!bonus) throw new NotFoundException('Signing bonus record not found');

        bonus.status = status;
        if (status === BonusStatus.APPROVED) {
            // Logic for approval trigger if needed
        }

        await bonus.save();
        return { message: `Bonus ${status}`, bonus };
    }

    async updateBenefitStatus(benefitRecordId: string, status: BenefitStatus) {
        const benefit = await this.benefitModel.findById(benefitRecordId);
        if (!benefit) throw new NotFoundException('Benefit record not found');

        benefit.status = status;
        await benefit.save();
        return { message: `Benefit ${status}`, benefit };
    }

    async editSigningBonus(bonusRecordId: string, givenAmount: number, userId?: string) {
        const bonus = await this.signingBonusModel.findById(bonusRecordId);
        if (!bonus) throw new NotFoundException('Signing bonus record not found');
        if (bonus.status !== BonusStatus.PENDING) {
            throw new BadRequestException('Can only edit bonuses with PENDING status');
        }

        const oldAmount = bonus.givenAmount;
        bonus.givenAmount = givenAmount;
        await bonus.save();

        // Audit log
        this.auditLog.push({
            timestamp: new Date(),
            action: 'EDIT_BONUS',
            entityType: 'SigningBonus',
            entityId: bonusRecordId,
            userId,
            changes: { oldAmount, newAmount: givenAmount }
        });

        return { message: 'Bonus amount updated', bonus };
    }

    async editBenefit(benefitRecordId: string, givenAmount: number, userId?: string) {
        const benefit = await this.benefitModel.findById(benefitRecordId);
        if (!benefit) throw new NotFoundException('Benefit record not found');
        if (benefit.status !== BenefitStatus.PENDING) {
            throw new BadRequestException('Can only edit benefits with PENDING status');
        }

        const oldAmount = benefit.givenAmount;
        benefit.givenAmount = givenAmount;
        await benefit.save();

        // Audit log
        this.auditLog.push({
            timestamp: new Date(),
            action: 'EDIT_BENEFIT',
            entityType: 'TerminationBenefit',
            entityId: benefitRecordId,
            userId,
            changes: { oldAmount, newAmount: givenAmount }
        });

        return { message: 'Benefit amount updated', benefit };
    }


    async validatePhase0Completion(): Promise<boolean> {
        const pendingBonuses = await this.signingBonusModel.countDocuments({ status: BonusStatus.PENDING });
        const pendingBenefits = await this.benefitModel.countDocuments({ status: BenefitStatus.PENDING });
        return pendingBonuses === 0 && pendingBenefits === 0;
    }

    // -----------------------
    // PHASE 1 - Payroll Initiation
    // -----------------------

    async getCurrentPayrollRun(): Promise<any> {
        return await this.payrollRunsModel.findOne().sort({ payrollPeriod: -1, createdAt: -1 }).lean();
    }

    async initiatePayrollPeriod(dto: InitiatePeriodDto) {
        const { payrollPeriod, entity, payrollSpecialistId, payrollManagerId } = dto;

        if (!payrollPeriod) throw new BadRequestException('payrollPeriod is required');
        if (!entity) throw new BadRequestException('entity is required');
        if (!payrollSpecialistId) throw new BadRequestException('payrollSpecialistId is required');
        if (!payrollManagerId) throw new BadRequestException('payrollManagerId is required');

        // Handle both YYYY-MM and YYYY-MM-DD string formats
        // If string is YYYY-MM format, append -01 to make it parseable
        const dateString = payrollPeriod.length === 7 ? `${payrollPeriod}-01` : payrollPeriod;
        const payrollDate = new Date(dateString);
        if (isNaN(payrollDate.getTime())) throw new BadRequestException('Invalid payrollPeriod date');

        const phase0Complete = await this.validatePhase0Completion();
        if (!phase0Complete) {
            throw new BadRequestException('Phase 0 has pending items. Resolve before initiating payroll.');
        }

        let run = await this.payrollRunsModel.findOne({ payrollPeriod: payrollDate, entity });

        if (!run) {
            run = new this.payrollRunsModel({
                runId: this._generateRunId(),
                payrollPeriod: payrollDate,
                status: PayRollStatus.DRAFT,
                entity,
                employees: 0,
                exceptions: 0,
                totalnetpay: 0,
                payrollSpecialistId: new Types.ObjectId(payrollSpecialistId) as any,
                payrollManagerId: new Types.ObjectId(payrollManagerId) as any,
                paymentStatus: PayRollPaymentStatus.PENDING,
            } as any);
        } else {
            run.status = PayRollStatus.DRAFT;
            run.payrollSpecialistId = new Types.ObjectId(payrollSpecialistId) as any;
            run.payrollManagerId = new Types.ObjectId(payrollManagerId) as any;
        }

        return await run.save();
    }


    // Phase 1.1 - Calculation Logic
    async startInitiation(runId: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) throw new NotFoundException('Payroll run not found');

        // 1. Fetch Global Configs
        const activeTaxes = await this.taxRulesModel.find({ status: ConfigStatus.APPROVED }).lean();
        const activeInsurances = await this.insuranceModel.find({ status: ConfigStatus.APPROVED }).lean();
        const activeAllowances = await this.allowanceModel.find({ status: ConfigStatus.APPROVED }).lean();

        // 2. Filter Employees
        const filterQuery: any = { status: EmployeeStatus.ACTIVE };
        const department = await this.departmentModel.findOne({ name: run.entity }).lean();
        if (department) {
            filterQuery.primaryDepartmentId = department._id;
        }
        const employees = await this.employeeModel.find(filterQuery).populate('payGradeId').exec();

        // 3. Define Time Boundaries
        const runDate = new Date(run.payrollPeriod);
        const startOfMonth = new Date(runDate.getFullYear(), runDate.getMonth(), 1);
        const endOfMonth = new Date(runDate.getFullYear(), runDate.getMonth() + 1, 0);

        // 4. Reset Run Stats
        let totalNetParams = 0;
        let exceptionsCount = 0;
        await this.paySlipModel.deleteMany({ payrollRunId: run._id });

        // 5. Process Each Employee
        for (const emp of employees) {
            if (!emp.payGradeId) continue;

            // CONTRACT VALIDATION: Skip employees with expired contracts
            if (emp.contractEndDate && new Date(emp.contractEndDate) < startOfMonth) {
                this.logger.warn(`Skipping employee ${emp._id} - contract expired on ${emp.contractEndDate}`);
                continue;
            }

            const result = await this._processEmployee(
                emp,
                run,
                { activeTaxes, activeInsurances, activeAllowances },
                { startOfMonth, endOfMonth }
            );

            if (result) {
                totalNetParams += result.netPay;
                if (result.isAnomaly) exceptionsCount++;

            }
        }

        // 6. Update Run Summary
        run.employees = employees.length;
        run.totalnetpay = totalNetParams;
        run.exceptions = exceptionsCount;
        await run.save();

        return { message: 'Payroll initiation started, draft generated', employeesProcessed: employees.length };
    }


    // --- Helper Methods for Calculation ---

    private async _processEmployee(emp: any, run: any, config: any, dates: { startOfMonth: Date, endOfMonth: Date }) {
        const grade = emp.payGradeId as unknown as payGrade;

        // 1. Proration
        const prorationFactor = this._calculateProrationFactor(emp, dates);
        const baseSalary = (grade.baseSalary || 0) * prorationFactor;
        let grossSalary = (grade.grossSalary || grade.baseSalary || 0) * prorationFactor;

        // 2. Earnings
        const { bonuses, bonusList } = await this._calculateBonuses(emp._id);
        const { benefits, benefitList } = await this._calculateBenefits(emp._id);
        const { refunds, refundList } = await this._calculateRefunds(emp._id);
        const { allowances, allowanceList } = this._calculateAllowances(config.activeAllowances);

        grossSalary += bonuses + benefits + allowances + refunds;

        // 3. Deductions
        const { taxes, taxList } = this._calculateTaxes(baseSalary, config.activeTaxes);
        const { insurances, insuranceList } = this._calculateInsurance(grossSalary, config.activeInsurances);
        let { penalties, penaltyList } = await this._calculatePenalties(emp._id, dates);

        // Calculate daily rate for unpaid leave deduction
        const daysInMonth = dates.endOfMonth.getDate();
        const dailyRate = baseSalary / daysInMonth;
        const { unpaidLeaveDeduction, unpaidLeaveList } = await this._calculateUnpaidLeaveDeduction(
            emp._id.toString(),
            dailyRate,
            dates
        );

        let totalDeductions = taxes + insurances + penalties + unpaidLeaveDeduction;
        let netPay = grossSalary - totalDeductions;

        // MINIMUM WAGE CHECK: Cap penalty deductions if they would reduce net below minimum wage
        if (netPay < this.MINIMUM_WAGE && penalties > 0) {
            const maxAllowedPenalty = Math.max(0, grossSalary - taxes - insurances - unpaidLeaveDeduction - this.MINIMUM_WAGE);
            if (maxAllowedPenalty < penalties) {
                this.logger.warn(`Employee ${emp._id}: Penalty capped from ${penalties} to ${maxAllowedPenalty} to maintain minimum wage`);
                penalties = maxAllowedPenalty;
                totalDeductions = taxes + insurances + penalties + unpaidLeaveDeduction;
                netPay = grossSalary - totalDeductions;
            }
        }

        // 4. Anomaly Check
        const isAnomaly = await this._checkAnomaly(emp, run._id, netPay);

        // 5. Persist Payslip
        await this.paySlipModel.create({
            employeeId: emp._id,
            payrollRunId: run._id,
            earningsDetails: {
                baseSalary: baseSalary,
                allowances: allowanceList,
                bonuses: bonusList,
                benefits: benefitList,
                refunds: refundList
            },
            deductionsDetails: {
                taxes: taxList,
                insurances: insuranceList,
                penalties: penaltyList.length > 0 ? { employeeId: emp._id, penalties: penaltyList, amountDeducted: penalties } : null,
                unpaidLeaves: unpaidLeaveList.length > 0 ? { days: unpaidLeaveList.reduce((s, l) => s + l.days, 0), deduction: unpaidLeaveDeduction, details: unpaidLeaveList } : null
            },
            totalGrossSalary: grossSalary,
            totaDeductions: totalDeductions,
            netPay: netPay,
            paymentStatus: PaySlipPaymentStatus.PENDING
        });


        return { netPay, isAnomaly };
    }

    private _calculateProrationFactor(emp: any, dates: { startOfMonth: Date, endOfMonth: Date }): number {
        const { startOfMonth, endOfMonth } = dates;
        const daysInMonth = endOfMonth.getDate();

        // Calculate Payable Start
        let payableStartDate = startOfMonth;
        if (emp.dateOfHire && new Date(emp.dateOfHire) > startOfMonth) {
            payableStartDate = new Date(emp.dateOfHire);
        }

        // Calculate Payable End
        let payableEndDate = endOfMonth;
        if (emp.contractEndDate && new Date(emp.contractEndDate) < endOfMonth) {
            payableEndDate = new Date(emp.contractEndDate);
        }

        // Calculate Payable Days
        let payableDays = 0;
        if (payableStartDate <= payableEndDate) {
            const diffTime = Math.abs(payableEndDate.getTime() - payableStartDate.getTime());
            payableDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        if (payableDays < daysInMonth && payableDays >= 0) {
            return payableDays / daysInMonth;
        }
        return 1.0;
    }

    private async _calculateBonuses(employeeId: string) {
        const bonuses = await this.signingBonusModel.find({
            employeeId: employeeId,
            status: BonusStatus.APPROVED
        }).populate('signingBonusId').lean();

        let total = 0;
        const list: any[] = [];
        for (const b of bonuses) {
            const config = b.signingBonusId as unknown as signingBonus;
            if (config) {
                total += b.givenAmount;
                list.push({
                    positionName: config.positionName,
                    amount: b.givenAmount,
                    status: ConfigStatus.APPROVED,
                    _id: b._id
                });
            }
        }
        return { bonuses: total, bonusList: list };
    }

    private async _calculateBenefits(employeeId: string) {
        const benefits = await this.benefitModel.find({
            employeeId: employeeId,
            status: BenefitStatus.APPROVED
        }).populate('benefitId').lean();

        let total = 0;
        const list: any[] = [];
        for (const b of benefits) {
            const config = b.benefitId as unknown as terminationAndResignationBenefits;
            if (config) {
                total += b.givenAmount;
                list.push({
                    name: config.name,
                    amount: b.givenAmount,
                    terms: config.terms,
                    status: ConfigStatus.APPROVED,
                    _id: b._id
                });
            }
        }
        return { benefits: total, benefitList: list };
    }

    private async _calculateRefunds(employeeId: string) {
        const pendingRefunds = await this.refundsModel.find({
            employeeId: employeeId,
            status: RefundStatus.PENDING
        }).lean();

        let total = 0;
        const list: any[] = [];
        for (const r of pendingRefunds) {
            if (r.refundDetails) {
                total += r.refundDetails.amount;
                list.push({
                    description: r.refundDetails.description,
                    amount: r.refundDetails.amount,
                    _id: r._id
                });
            }
        }
        return { refunds: total, refundList: list };
    }

    private _calculateAllowances(activeAllowances: any[]) {
        let total = 0;
        const list: any[] = [];
        for (const all of activeAllowances) {
            total += all.amount;
            list.push({
                name: all.name,
                amount: all.amount,
                status: all.status,
                _id: all._id
            });
        }
        return { allowances: total, allowanceList: list };
    }

    private _calculateTaxes(baseSalary: number, activeTaxes: any[]) {
        let total = 0;
        const list: any[] = [];
        for (const tax of activeTaxes) {
            const taxAmount = (baseSalary * tax.rate) / 100;
            total += taxAmount;
            list.push({
                name: tax.name,
                rate: tax.rate,
                status: tax.status
            });
        }
        return { taxes: total, taxList: list };
    }

    private _calculateInsurance(grossSalary: number, activeInsurances: any[]) {
        let total = 0;
        const list: any[] = [];
        for (const ins of activeInsurances) {
            if (grossSalary >= ins.minSalary && grossSalary <= ins.maxSalary) {
                const insAmount = (grossSalary * ins.employeeRate) / 100;
                total += insAmount;
                list.push({
                    name: ins.name,
                    amount: insAmount,
                    minSalary: ins.minSalary,
                    maxSalary: ins.maxSalary,
                    employeeRate: ins.employeeRate,
                    employerRate: ins.employerRate,
                    status: ins.status
                });
            }
        }
        return { insurances: total, insuranceList: list };
    }

    private async _calculatePenalties(employeeId: string, dates: { startOfMonth: Date, endOfMonth: Date }) {
        const penaltyDocs = await this.penaltyModel.find({
            employeeId: employeeId,
            createdAt: { $gte: dates.startOfMonth, $lte: dates.endOfMonth }
        }).lean();

        let total = 0;
        const list: any[] = [];
        for (const doc of penaltyDocs) {
            if (doc.penalties) {
                for (const p of doc.penalties) {
                    total += p.amount;
                    list.push(p);
                }
            }
        }
        return { penalties: total, penaltyList: list };
    }

    private async _calculateUnpaidLeaveDeduction(
        employeeId: string,
        dailyRate: number,
        dates: { startOfMonth: Date, endOfMonth: Date }
    ) {
        // Find approved leaves for this employee in the payroll period
        const leaves = await this.leaveRequestModel.find({
            employeeId: employeeId,
            status: LeaveStatus.APPROVED,
            'dates.from': { $lte: dates.endOfMonth },
            'dates.to': { $gte: dates.startOfMonth }
        }).populate('leaveTypeId').lean();

        let totalUnpaidDays = 0;
        const unpaidLeaveList: Array<{ leaveType: string; days: number; deduction: number }> = [];

        for (const leave of leaves) {
            const leaveType = leave.leaveTypeId as unknown as LeaveType;

            // Only process unpaid leaves (paid: false)
            if (leaveType && leaveType.paid === false) {
                // Calculate days within the payroll period
                const leaveStart = new Date(leave.dates.from);
                const leaveEnd = new Date(leave.dates.to);
                const periodStart = dates.startOfMonth;
                const periodEnd = dates.endOfMonth;

                // Overlap calculation
                const effectiveStart = leaveStart > periodStart ? leaveStart : periodStart;
                const effectiveEnd = leaveEnd < periodEnd ? leaveEnd : periodEnd;

                const daysInPeriod = Math.max(0,
                    Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
                );

                if (daysInPeriod > 0) {
                    const deduction = daysInPeriod * dailyRate;
                    totalUnpaidDays += daysInPeriod;
                    unpaidLeaveList.push({
                        leaveType: leaveType.name || 'Unpaid Leave',
                        days: daysInPeriod,
                        deduction
                    });
                }
            }
        }

        return {
            unpaidLeaveDays: totalUnpaidDays,
            unpaidLeaveDeduction: totalUnpaidDays * dailyRate,
            unpaidLeaveList
        };
    }

    private async _checkAnomaly(emp: any, runId: any, netPay: number): Promise<boolean> {
        // 1. Negative Net Pay
        if (netPay < 0) return true;
        // 2. Missing Bank Details
        if (!emp.bankAccountNumber) return true;

        // 3. Sudden Salary Spike
        const lastPayslip = await this.paySlipModel.findOne({
            employeeId: emp._id,
            payrollRunId: { $ne: runId }
        }).sort({ createdAt: -1 }).lean();

        if (lastPayslip && lastPayslip.netPay > 0) {
            const percentChange = (netPay - lastPayslip.netPay) / lastPayslip.netPay;
            if (percentChange > 0.5) return true;
        }

        return false;
    }

    // -----------------------
    // Post-Initiation Logic
    // -----------------------

    async editPayrollPeriod(runId: string, dto: EditPeriodDto) {
        return this.payrollRunsModel.findOneAndUpdate({ runId }, { ...dto }, { new: true });
    }

    async rejectPayrollPeriod(runId: string, reason: string) {
        return this.payrollRunsModel.findOneAndUpdate({ runId }, { status: PayRollStatus.REJECTED, rejectionReason: reason }, { new: true });
    }

    async submitForReview(runId: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) throw new NotFoundException('Payroll run not found');
        if (run.status !== PayRollStatus.DRAFT) {
            throw new BadRequestException('Only Draft payrolls can be submitted for review');
        }

        run.status = PayRollStatus.UNDER_REVIEW;
        return run.save();
    }

    async approveByManager(runId: string, managerId: string) {
        return this.payrollRunsModel.findOneAndUpdate({ runId }, {
            status: PayRollStatus.PENDING_FINANCE_APPROVAL,
            payrollManagerId: new Types.ObjectId(managerId) as any,
            managerApprovalDate: new Date()
        }, { new: true });
    }

    async rejectByManager(runId: string, managerId: string, reason: string) {
        return this.payrollRunsModel.findOneAndUpdate({ runId }, {
            status: PayRollStatus.REJECTED,
            payrollManagerId: new Types.ObjectId(managerId) as any,
            rejectionReason: reason
        }, { new: true });
    }

    async approveByFinance(runId: string, financeId: string) {
        return this.payrollRunsModel.findOneAndUpdate({ runId }, {
            status: PayRollStatus.APPROVED,
            financeStaffId: new Types.ObjectId(financeId) as any,
            financeApprovalDate: new Date()
        }, { new: true });
    }

    async rejectByFinance(runId: string, financeId: string, reason: string) {
        return this.payrollRunsModel.findOneAndUpdate({ runId }, {
            status: PayRollStatus.REJECTED,
            financeStaffId: new Types.ObjectId(financeId) as any,
            rejectionReason: reason
        }, { new: true });
    }

    async executePayroll(runId: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) throw new NotFoundException('Payroll run not found');
        if (run.status !== PayRollStatus.APPROVED) throw new BadRequestException('Payroll must be approved before execution');

        run.status = PayRollStatus.LOCKED;
        run.paymentStatus = PayRollPaymentStatus.PAID;

        await this.paySlipModel.updateMany({ payrollRunId: run._id }, { paymentStatus: PaySlipPaymentStatus.PAID });

        // Mark Bonuses and Benefits as PAID to prevent double payment
        const slips = await this.paySlipModel.find({ payrollRunId: run._id }).lean();
        for (const slip of slips) {
            // Update Bonuses
            if (slip.earningsDetails.bonuses && slip.earningsDetails.bonuses.length > 0) {
                const bonusIds = slip.earningsDetails.bonuses.map((b: any) => b._id);

                await this.signingBonusModel.updateMany(
                    { _id: { $in: bonusIds } },
                    { status: BonusStatus.PAID, paymentDate: new Date() }
                );
            }
            // Update Benefits
            if (slip.earningsDetails.benefits && slip.earningsDetails.benefits.length > 0) {
                const benefitIds = slip.earningsDetails.benefits.map((b: any) => b._id);
                await this.benefitModel.updateMany(
                    { _id: { $in: benefitIds } },
                    { status: BenefitStatus.PAID }
                );
            }
            // Update Refunds
            if (slip.earningsDetails.refunds && slip.earningsDetails.refunds.length > 0) {
                const refundIds = slip.earningsDetails.refunds.map((r: any) => r._id);
                await this.refundsModel.updateMany(
                    { _id: { $in: refundIds } },
                    { status: RefundStatus.PAID, paidInPayrollRunId: run._id }
                );
            }
        }

        return run.save();
    }

    async unfreezePayroll(runId: string, managerId: string, reason: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) throw new NotFoundException('Payroll run not found');
        if (run.status !== PayRollStatus.LOCKED) throw new BadRequestException('Payroll is not locked');

        run.status = PayRollStatus.APPROVED;
        run.unlockReason = reason;
        return run.save();
    }

    async updatePayslip(payslipId: string, dto: UpdatePayslipDto) {
        const slip = await this.paySlipModel.findById(payslipId);
        if (!slip) throw new NotFoundException('Payslip not found');

        // Check if run is editable (DRAFT or REJECTED)
        const run = await this.payrollRunsModel.findById(slip.payrollRunId);
        if (!run || (run.status !== PayRollStatus.DRAFT && run.status !== PayRollStatus.REJECTED)) {
            throw new BadRequestException('Cannot update payslip in current run status');
        }

        // Apply Updates
        if (dto.earningsDetails) {
            if (dto.earningsDetails.baseSalary !== undefined) slip.earningsDetails.baseSalary = dto.earningsDetails.baseSalary;
            if (dto.earningsDetails.allowances) slip.earningsDetails.allowances = dto.earningsDetails.allowances as any;
            if (dto.earningsDetails.bonuses) slip.earningsDetails.bonuses = dto.earningsDetails.bonuses as any;
            if (dto.earningsDetails.benefits) slip.earningsDetails.benefits = dto.earningsDetails.benefits as any;
            if (dto.earningsDetails.refunds) slip.earningsDetails.refunds = dto.earningsDetails.refunds as any;
        }

        if (dto.deductionsDetails) {
            if (dto.deductionsDetails.taxes) slip.deductionsDetails.taxes = dto.deductionsDetails.taxes as any;
            if (dto.deductionsDetails.insurances) slip.deductionsDetails.insurances = dto.deductionsDetails.insurances as any;
            if (dto.deductionsDetails.penalties) slip.deductionsDetails.penalties = dto.deductionsDetails.penalties as any;
        }

        // Recalculate Totals
        // 1. Gross
        let totalAllowances = 0;
        slip.earningsDetails.allowances.forEach(a => totalAllowances += a.amount);
        let totalBonuses = 0;
        if (slip.earningsDetails.bonuses) slip.earningsDetails.bonuses.forEach(b => totalBonuses += b.amount);
        let totalBenefits = 0;
        if (slip.earningsDetails.benefits) slip.earningsDetails.benefits.forEach(b => totalBenefits += b.amount);
        let totalRefunds = 0;
        if (slip.earningsDetails.refunds) slip.earningsDetails.refunds.forEach(r => totalRefunds += r.amount);

        const newGross = slip.earningsDetails.baseSalary + totalAllowances + totalBonuses + totalBenefits + totalRefunds;
        slip.totalGrossSalary = newGross;

        // 2. Deductions
        let totalDeductions = 0;
        slip.deductionsDetails.taxes.forEach(t => {
            // If tax amount is not explicitly stored in simple schema, we might need to rely on 'rate' or if user passed overrides.
            // Tax is calculated on Base Salary
            // Note: Schema stores rate but not amount, so we recalculate based on current rate in payslip.
            totalDeductions += (slip.earningsDetails.baseSalary * t.rate) / 100;
        });

        if (slip.deductionsDetails.insurances) {
            slip.deductionsDetails.insurances.forEach(i => {
                // insuranceBrackets has employeeRate (percentage), not a flat amount
                if (i.employeeRate) totalDeductions += (newGross * i.employeeRate) / 100;
            });

        }

        if (slip.deductionsDetails.penalties && slip.deductionsDetails.penalties.penalties) {
            slip.deductionsDetails.penalties.penalties.forEach(p => totalDeductions += p.amount);
        }

        slip.totaDeductions = totalDeductions;
        slip.netPay = newGross - totalDeductions;

        await slip.save();

        // Update Run Total
        await this._updateRunTotal(slip.payrollRunId);

        return slip;
    }

    async exportBankFile(runId: string) {
        const run: any = await this.payrollRunsModel.findOne({ runId })
            .populate('payrollSpecialistId')
            .populate('payrollManagerId')
            .populate('financeStaffId')
            .lean();

        if (!run) throw new NotFoundException('Payroll run not found');

        const slips = await this.paySlipModel.find({ payrollRunId: run._id, netPay: { $gt: 0 } }).populate('employeeId').lean();

        return new Promise((resolve, reject) => {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Styles & Helpers ---
            const primaryColor = '#4F46E5'; // Indigo-600 match
            const greyColor = '#9CA3AF';
            const tableHeaderBg = '#F3F4F6';
            const tableHeaderColor = '#1F2937';

            // --- Header Section ---
            // Company Logo/Name
            doc.fontSize(20).font('Helvetica-Bold').fillColor(primaryColor).text('HR Consultant Company', { align: 'left' });

            // Document Title
            doc.moveDown(0.2);
            doc.fontSize(10).font('Helvetica').fillColor(greyColor).text('Bank Transfer File', { align: 'left' });

            // Date & Metadata right aligned (at top)
            doc.font('Helvetica').fontSize(10).fillColor('#374151');
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right', at: [400, 50] });
            doc.text(`Run ID: ${runId}`, { align: 'right', at: [400, 65] });

            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#E5E7EB').stroke();
            doc.moveDown(2);

            // --- Table Config ---
            const startX = 50;
            const colWidths = [180, 120, 100, 100]; // Total ~500
            const tableTop = doc.y;
            const rowHeight = 30;

            // --- Table Header ---
            const headers = ['Employee Name', 'Bank Account', 'Bank Name', 'Net Pay (EGP)'];

            // Draw Header Background
            doc.rect(startX, tableTop, 500, rowHeight).fill(tableHeaderBg);

            // Draw Header Text
            let xPos = startX + 10; // padding
            headers.forEach((header, i) => {
                doc.fillColor(tableHeaderColor).font('Helvetica-Bold').fontSize(10);
                if (i === 3) {
                    // Right align amount
                    doc.text(header, xPos, tableTop + 10, { width: colWidths[i] - 20, align: 'right' });
                } else {
                    doc.text(header, xPos, tableTop + 10, { width: colWidths[i] - 10, align: 'left' });
                }
                xPos += colWidths[i];
            });

            // --- Table Rows ---
            let yPos = tableTop + rowHeight;
            let totalAmount = 0;

            slips.forEach((slip: any, index: number) => {
                // Check for page break
                if (yPos > doc.page.height - 100) {
                    doc.addPage();
                    yPos = 50;
                    // Redraw Header on new page
                    doc.rect(startX, yPos, 500, rowHeight).fill(tableHeaderBg);
                    let xHeader = startX + 10;
                    headers.forEach((header, i) => {
                        doc.fillColor(tableHeaderColor).font('Helvetica-Bold').fontSize(10);
                        if (i === 3) {
                            doc.text(header, xHeader, yPos + 10, { width: colWidths[i] - 20, align: 'right' });
                        } else {
                            doc.text(header, xHeader, yPos + 10, { width: colWidths[i] - 10, align: 'left' });
                        }
                        xHeader += colWidths[i];
                    });
                    yPos += rowHeight;
                }

                const emp = slip.employeeId as unknown as EmployeeProfile;

                // Zebra Striping
                if (index % 2 === 1) {
                    doc.rect(startX, yPos, 500, rowHeight).fill('#F9FAFB');
                }

                // Draw Bottom Border
                doc.moveTo(startX, yPos + rowHeight).lineTo(550, yPos + rowHeight).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

                // Row Text
                doc.fillColor('#374151').font('Helvetica').fontSize(10);
                let xCol = startX + 10;

                // 1. Name
                doc.text(`${emp.firstName} ${emp.lastName}`, xCol, yPos + 10, { width: colWidths[0] - 10 });
                xCol += colWidths[0];

                // 2. Account
                doc.text(emp.bankAccountNumber || 'N/A', xCol, yPos + 10, { width: colWidths[1] - 10 });
                xCol += colWidths[1];

                // 3. Bank
                doc.text(emp.bankName || 'N/A', xCol, yPos + 10, { width: colWidths[2] - 10 });
                xCol += colWidths[2];

                // 4. Amount
                doc.font('Helvetica-Bold');
                doc.text(slip.netPay.toFixed(2), xCol, yPos + 10, { width: colWidths[3] - 20, align: 'right' });

                totalAmount += slip.netPay;
                yPos += rowHeight;
            });

            // --- Footer / Summary ---
            // Ensure footer fits on page, else add page
            if (yPos > doc.page.height - 100) {
                doc.addPage();
                yPos = 50;
            }

            const footerTop = yPos + 20;
            doc.rect(startX + 300, footerTop, 200, 40).fill('#F9FAFB'); // Summary box bg
            doc.rect(startX + 300, footerTop, 200, 40).strokeColor('#E5E7EB').stroke();

            doc.fillColor('#374151').font('Helvetica-Bold').fontSize(12);
            doc.text('TOTAL:', startX + 320, footerTop + 13);
            doc.fillColor(primaryColor).text(`${totalAmount.toFixed(2)} EGP`, startX + 320, footerTop + 13, { width: 160, align: 'right' });

            // Page Numbering Footer + Confidentiality
            const range = doc.bufferedPageRange();
            // IMPORTANT: Set bottom margin to 0 for footer loop to prevent auto page adding
            const originalBottomMargin = doc.page.margins.bottom;
            doc.page.margins.bottom = 0;

            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);

                // Confidentiality
                doc.fontSize(8).fillColor('#EF4444').text(
                    'CONFIDENTIAL - FOR BANK USE ONLY',
                    50,
                    doc.page.height - 45,
                    { align: 'center', width: 500 }
                );

                doc.fontSize(8).fillColor(greyColor).text(
                    `Page ${i + 1} of ${range.count} - Generated by HR Consultant Company System`,
                    50,
                    doc.page.height - 30,
                    { align: 'center', width: 500 }
                );
            }

            // Restore margin (clean up)
            doc.page.margins.bottom = originalBottomMargin;

            doc.end();
        });
    }

    async getMyPayslips(employeeId: string) {
        if (!employeeId) {
            console.error('getMyPayslips: employeeId is missing');
            return [];
        }
        try {
            return await this.paySlipModel.find({ employeeId }).sort({ createdAt: -1 }).populate('payrollRunId').lean();
        } catch (error) {
            console.error('getMyPayslips Error:', error);
            throw error;
        }
    }

    async getPayslipsForRun(runId: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) return [];
        return this.paySlipModel.find({ payrollRunId: run._id }).populate('employeeId').lean();
    }

    async getAllRuns(): Promise<payrollRuns[]> {
        return this.payrollRunsModel.find().sort('payrollPeriod').lean() as unknown as payrollRuns[];
    }

    async getPayslipById(id: string) {
        return this.paySlipModel.findById(id).populate('employeeId').lean();
    }

    private async _updateRunTotal(runId: any) {
        const slips = await this.paySlipModel.find({ payrollRunId: runId });
        let totalNet = 0;
        slips.forEach(s => totalNet += s.netPay);
        await this.payrollRunsModel.findByIdAndUpdate(runId, { totalnetpay: totalNet });
    }

    private _generateRunId() {
        return `RUN-${Date.now()}`;
    }

    async getAnomalies(runId: string) {
        if (!runId || runId === 'undefined') return [];

        try {
            const run = await this.payrollRunsModel.findOne({ runId });
            if (!run) return [];

            const slips = await this.paySlipModel.find({ payrollRunId: run._id }).populate('employeeId').lean();
            const anomalies: any[] = [];

            for (const slip of slips) {
                const emp = slip.employeeId as unknown as EmployeeProfile;

                // Robust check: ensure emp exists AND is a populated object (has firstName), not just an ID
                if (!emp || !(emp as any).firstName) continue;

                const reasons: string[] = [];

                // 1. Negative Net Pay
                if (slip.netPay < 0) reasons.push('Negative Net Pay');

                // 2. Missing Bank Details
                if (!emp.bankAccountNumber) reasons.push('Missing Bank Account');

                // 3. Spikes
                const lastPayslip = await this.paySlipModel.findOne({
                    employeeId: (emp as any)._id,
                    payrollRunId: { $ne: runId },
                    createdAt: { $lt: (slip as any).createdAt || new Date() }
                }).sort({ createdAt: -1 }).lean();

                if (lastPayslip && lastPayslip.netPay > 0) {
                    const percentChange = (slip.netPay - lastPayslip.netPay) / lastPayslip.netPay;
                    if (percentChange > 0.5) reasons.push(`Salary Spike: ${(percentChange * 100).toFixed(1)}% increase`);
                }

                if (reasons.length > 0) {
                    const payslipId = (slip as any)._id.toString();
                    const resolution = this.resolvedAnomalies.get(payslipId);

                    anomalies.push({
                        payslipId,
                        employeeId: (emp as any)._id,
                        employeeName: `${emp.firstName} ${emp.lastName}`,
                        netPay: slip.netPay,
                        reasons,
                        resolved: !!resolution,
                        resolvedAt: resolution?.resolvedAt || null,
                        resolutionNotes: resolution?.notes || null
                    });
                }
            }
            return anomalies;
        } catch (error) {
            console.error('Detailed Error in getAnomalies:', error);
            // Return empty list on failure to prevent frontend crash
            return [];
        }
    }

    async resolveAnomaly(payslipId: string, notes: string) {
        const slip = await this.paySlipModel.findById(payslipId);
        if (!slip) throw new NotFoundException('Payslip not found');

        this.resolvedAnomalies.set(payslipId, {
            resolvedAt: new Date(),
            notes: notes || 'Resolved without notes'
        });

        return { message: 'Anomaly marked as resolved', payslipId, notes };
    }

    async unresolveAnomaly(payslipId: string) {
        if (!this.resolvedAnomalies.has(payslipId)) {
            throw new BadRequestException('Anomaly was not resolved');
        }

        this.resolvedAnomalies.delete(payslipId);
        return { message: 'Anomaly resolution removed', payslipId };
    }

    // -----------------------
    // REPORTS
    // -----------------------

    async getPayrollSummaryReport(runId: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) throw new NotFoundException('Payroll run not found');

        const payslips = await this.paySlipModel.find({ payrollRunId: run._id }).lean();

        const summary = {
            runId: run.runId,
            payrollPeriod: run.payrollPeriod,
            entity: run.entity,
            status: run.status,
            employeesProcessed: payslips.length,
            totalGrossSalary: 0,
            totalDeductions: 0,
            totalNetPay: 0,
            breakdowns: {
                totalBaseSalary: 0,
                totalAllowances: 0,
                totalBonuses: 0,
                totalBenefits: 0,
                totalRefunds: 0,
                totalTaxes: 0,
                totalInsurance: 0,
                totalPenalties: 0
            }
        };

        for (const slip of payslips) {
            summary.totalGrossSalary += slip.totalGrossSalary || 0;
            summary.totalDeductions += slip.totaDeductions || 0;
            summary.totalNetPay += slip.netPay || 0;

            const e = slip.earningsDetails as any || {};
            const d = slip.deductionsDetails as any || {};

            summary.breakdowns.totalBaseSalary += e.baseSalary || 0;
            summary.breakdowns.totalAllowances += (e.allowances || []).reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
            summary.breakdowns.totalBonuses += (e.bonuses || []).reduce((sum: number, b: any) => sum + (b.givenAmount || 0), 0);
            summary.breakdowns.totalBenefits += (e.benefits || []).reduce((sum: number, b: any) => sum + (b.givenAmount || 0), 0);
            summary.breakdowns.totalRefunds += (e.refunds || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
            summary.breakdowns.totalTaxes += (d.taxes || []).reduce((sum: number, t: any) => sum + (t.deductionAmount || 0), 0);
            summary.breakdowns.totalInsurance += (d.insurances || []).reduce((sum: number, i: any) => sum + (i.employeeContribution || 0), 0);
            summary.breakdowns.totalPenalties += d.penalties?.amountDeducted || 0;
        }

        return summary;
    }

    async getTaxReport(runId: string) {
        const run = await this.payrollRunsModel.findOne({ runId });
        if (!run) throw new NotFoundException('Payroll run not found');

        const payslips = await this.paySlipModel.find({ payrollRunId: run._id })
            .populate('employeeId', 'firstName lastName employeeNumber')
            .lean();

        const taxDetails: Array<{
            employeeId: string;
            employeeName: string;
            employeeNumber: string;
            grossSalary: number;
            taxBreakdown: Array<{ bracket: string; amount: number }>;
            totalTax: number;
        }> = [];

        let grandTotalTax = 0;

        for (const slip of payslips) {
            const emp = slip.employeeId as any;
            const d = slip.deductionsDetails as any || {};
            const taxes = d.taxes || [];
            const totalTax = taxes.reduce((sum: number, t: any) => sum + (t.deductionAmount || 0), 0);
            grandTotalTax += totalTax;

            taxDetails.push({
                employeeId: emp?._id?.toString() || '',
                employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
                employeeNumber: emp?.employeeNumber || '',
                grossSalary: slip.totalGrossSalary || 0,
                taxBreakdown: taxes.map((t: any) => ({ bracket: t.bracket || 'Standard', amount: t.deductionAmount || 0 })),
                totalTax
            });
        }

        return {
            runId: run.runId,
            payrollPeriod: run.payrollPeriod,
            entity: run.entity,
            grandTotalTax,
            employeeCount: taxDetails.length,
            taxDetails
        };
    }

    getAuditLog() {
        return this.auditLog;
    }
}