import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, FilterQuery, Types } from 'mongoose';
import { ConfigStatus, PolicyType } from './enums/payroll-configuration-enums';

import { signingBonus } from './Models/SigningBonus.schema';
import { taxRules } from './Models/taxRules.schema';
import { terminationAndResignationBenefits } from './Models/terminationAndResignationBenefits';
import { allowance, allowanceDocument } from './Models/allowance.schema';
import {
  CompanyWideSettings,
  CompanyWideSettingsDocument,
} from './Models/CompanyWideSettings.schema';
import {
  insuranceBrackets,
  insuranceBracketsDocument,
} from './Models/insuranceBrackets.schema';
import { payType, payTypeDocument } from './Models/PayType.schema';
import {
  CreatePayTypeDto,
  UpdatePayTypeDto,
} from './dto/pay-type';
import {
  CreatePayrollPolicyDto,
  UpdatePayrollPolicyDto,
} from './dto/payroll-policy';
import {
  CreatePayGradeDto,
  UpdatePayGradeDto,
} from './dto/pay-grade';
import { CreateAllowanceDto, UpdateAllowanceDto } from './dto/allowance';
import { CreateSigningBonusDto, UpdateSigningBonusDto } from './dto/signing-bonus';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/tax-rule';
import { CreateTerminationBenefitDto, UpdateTerminationBenefitDto } from './dto/termination-benefit';
import { CreateInsuranceBracketDto, UpdateInsuranceBracketDto } from './dto/insurance-bracket';
import { CompanyWideSettingsDto } from './dto/company-settings';
import { ApprovalDto } from './dto/approval.dto';
import {
  payrollPolicies,
  payrollPoliciesDocument,
} from './Models/payrollPolicies.schema';
import { payGrade, payGradeDocument } from './Models/payGrades.schema';

type AllowancePayload = Pick<allowance, 'name' | 'amount'> & {
  createdBy?: string;
  status?: ConfigStatus;
};

type InsurancePayload = Pick<
  insuranceBrackets,
  'name' | 'minSalary' | 'maxSalary' | 'employeeRate' | 'employerRate'
> & {
  createdBy?: string;
  status?: ConfigStatus;
};

interface UpdateStatusPayload {
  status: ConfigStatus;
  approverId?: string;
}

@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(signingBonus.name)
    private signingBonusModel: mongoose.Model<signingBonus>,

    @InjectModel(taxRules.name)
    private taxRulesModel: mongoose.Model<taxRules>,

    @InjectModel(terminationAndResignationBenefits.name)
    private termModel: mongoose.Model<terminationAndResignationBenefits>,

    @InjectModel(allowance.name)
    private readonly allowanceModel: Model<allowanceDocument>,

    @InjectModel(CompanyWideSettings.name)
    private readonly companySettingsModel: Model<CompanyWideSettingsDocument>,

    @InjectModel(insuranceBrackets.name)
    private readonly insuranceModel: Model<insuranceBracketsDocument>,

    @InjectModel(payType.name)
    private readonly payTypeModel: Model<payTypeDocument>,

    @InjectModel(payrollPolicies.name)
    private readonly payrollPoliciesModel: Model<payrollPoliciesDocument>,

    @InjectModel(payGrade.name)
    private readonly payGradeModel: Model<payGradeDocument>,
  ) { }

  // ------- Signing Bonus -------
  async createSigningBonus(dto: any) {
    try {
      dto.status = dto.status || ConfigStatus.DRAFT;
      return await this.signingBonusModel.create(dto);
    } catch (error) {
      console.error('Error creating signing bonus:', error);
      throw new BadRequestException(error.message || 'Failed to create signing bonus');
    }
  }

  async updateSigningBonus(id: string, dto: any) {
    try {
      const doc = await this.signingBonusModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Signing bonus not found');



      return await this.signingBonusModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    } catch (error) {
      console.error('Error updating signing bonus:', error);
      throw error;
    }
  }

  async getAllSigningBonus(status?: ConfigStatus) {
    const filter = status ? { status } : {};
    return this.signingBonusModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getOneSigningBonus(id: string) {
    const doc = await this.signingBonusModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Signing bonus not found');
    return doc;
  }

  async approveSigningBonus(id: string, approvedBy: string) {
    return this.signingBonusModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.APPROVED,
        approvedBy: this.toObjectId(approvedBy),
        approvedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async rejectSigningBonus(id: string, rejectedBy: string, reason: string) {
    return this.signingBonusModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.REJECTED,
        rejectedBy: this.toObjectId(rejectedBy),
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).exec();
  }

  // ------- Tax Rules -------
  async createTaxRule(dto: any) {
    try {
      dto.status = dto.status || ConfigStatus.DRAFT;
      return await this.taxRulesModel.create(dto);
    } catch (error) {
      console.error('Error creating tax rule:', error);
      throw new BadRequestException(error.message || 'Failed to create tax rule');
    }
  }

  async updateTaxRule(id: string, dto: any) {
    try {
      const doc = await this.taxRulesModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Tax rule not found');
      return await this.taxRulesModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    } catch (error) {
      console.error('Error updating tax rule:', error);
      throw error;
    }
  }

  async getAllTaxRules(status?: ConfigStatus) {
    const filter = status ? { status } : {};
    return this.taxRulesModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getOneTaxRule(id: string) {
    const doc = await this.taxRulesModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Tax rule not found');
    return doc;
  }

  async approveTaxRule(id: string, approvedBy: string) {
    return this.taxRulesModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.APPROVED,
        approvedBy: this.toObjectId(approvedBy),
        approvedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async rejectTaxRule(id: string, rejectedBy: string, reason: string) {
    return this.taxRulesModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.REJECTED,
        rejectedBy: this.toObjectId(rejectedBy),
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).exec();
  }

  async deleteTaxRule(id: string): Promise<void> {
    try {
      const objId = this.toObjectId(id.trim());
      console.log(`Attempting to delete Tax Rule with ID: ${objId}`);
      const result = await this.taxRulesModel.findByIdAndDelete(objId).exec();
      if (!result) {
        throw new NotFoundException('Tax rule not found');
      }
      console.log(`Successfully deleted Tax Rule: ${result._id}`);
    } catch (error) {
      console.error('Error deleting tax rule:', error);
      throw error;
    }
  }

  // ------- Termination Benefits -------
  async createTerminationBenefit(dto: any) {
    try {
      dto.status = dto.status || ConfigStatus.DRAFT;
      return await this.termModel.create(dto);
    } catch (error) {
      console.error('Error creating termination benefit:', error);
      throw new BadRequestException(error.message || 'Failed to create termination benefit');
    }
  }

  async updateTerminationBenefit(id: string, dto: any) {
    const doc = await this.termModel.findById(id);
    if (!doc) throw new BadRequestException('Termination benefit not found');
    return this.termModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async getAllTerminationBenefits(status?: ConfigStatus) {
    const filter = status ? { status } : {};
    return this.termModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getOneTerminationBenefit(id: string) {
    const doc = await this.termModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Termination benefit not found');
    return doc;
  }

  async approveTerminationBenefit(id: string, approvedBy: string) {
    return this.termModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.APPROVED,
        approvedBy: this.toObjectId(approvedBy),
        approvedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async rejectTerminationBenefit(id: string, rejectedBy: string, reason: string) {
    return this.termModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.REJECTED,
        rejectedBy: this.toObjectId(rejectedBy),
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).exec();
  }

  async deleteTerminationBenefit(id: string): Promise<void> {
    try {
      const objId = this.toObjectId(id.trim());
      console.log(`Attempting to delete Termination Benefit with ID: ${objId}`);
      const result = await this.termModel.findByIdAndDelete(objId).exec();
      if (!result) {
        console.warn(`Termination Benefit with ID ${objId} not found for deletion`);
        throw new NotFoundException('Termination benefit not found');
      }
      console.log(`Successfully deleted Termination Benefit: ${result._id}`);
    } catch (error) {
      console.error('Error deleting termination benefit:', error);
      throw error;
    }
  }

  async deleteSigningBonus(id: string): Promise<void> {
    try {
      const objId = this.toObjectId(id.trim());
      console.log(`Attempting to delete Signing Bonus with ID: ${objId}`);
      const result = await this.signingBonusModel.findByIdAndDelete(objId).exec();
      if (!result) {
        console.warn(`Signing Bonus with ID ${objId} not found for deletion`);
        throw new NotFoundException('Signing bonus not found');
      }
      console.log(`Successfully deleted Signing Bonus: ${result._id}`);
    } catch (error) {
      console.error('Error deleting signing bonus:', error);
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               Pay Types API                                */
  /* -------------------------------------------------------------------------- */

  async createPayType(
    createDto: CreatePayTypeDto,
  ): Promise<payTypeDocument> {
    try {
      console.log('Attempting to create Pay Type:', createDto.type);
      const exists = await this.payTypeModel
        .findOne({ type: createDto.type })
        .lean()
        .exec();
      if (exists) {
        throw new ConflictException(
          `Pay type "${createDto.type}" already exists`,
        );
      }

      // Validate description: only validate length if description is actually provided and not empty
      if (createDto.description && createDto.description.trim().length > 0 && createDto.description.length < 10) {
        throw new BadRequestException(
          'Description must be at least 10 characters if provided',
        );
      }

      const created = await this.payTypeModel.create({
        ...createDto,
        status: createDto.status || ConfigStatus.DRAFT,
      });
      console.log(`Successfully created Pay Type: ${created._id}`);
      return created;
    } catch (error) {
      console.error('Error creating pay type:', error);
      throw new BadRequestException(error.message || 'Failed to create pay type');
    }
  }

  async getAllPayTypes(
    status?: ConfigStatus,
  ): Promise<payTypeDocument[]> {
    const filter: FilterQuery<payTypeDocument> = {};
    if (status) {
      filter.status = status;
    }

    return this.payTypeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPayTypeById(id: string): Promise<payTypeDocument> {
    const payTypeDoc = await this.payTypeModel.findById(id).exec();
    if (!payTypeDoc) {
      throw new NotFoundException(`Pay type with id ${id} not found`);
    }
    return payTypeDoc;
  }

  async updatePayType(
    id: string,
    updateDto: UpdatePayTypeDto,
  ): Promise<payTypeDocument> {
    const payTypeDoc = await this.getPayTypeById(id);

    // Validate description: only validate length if description is provided and not empty
    if (updateDto.description !== undefined && updateDto.description !== null) {
      if (updateDto.description.trim().length > 0 && updateDto.description.length < 10) {
        throw new BadRequestException(
          'Description must be at least 10 characters if provided',
        );
      }
    }

    Object.assign(payTypeDoc, updateDto);
    return payTypeDoc.save();
  }

  async deletePayType(id: string): Promise<void> {
    const payTypeDoc = await this.getPayTypeById(id);

    // Validate if pay type can be deleted
    const canDelete = await this.validateDeletion('payType', id);
    if (!canDelete) {
      throw new BadRequestException(
        'Cannot delete pay type: it is being used by employee contracts',
      );
    }

    const result = await this.payTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Pay type with id ${id} not found`);
    }
  }

  async approvePayType(
    id: string,
    approvedBy: string,
  ): Promise<payTypeDocument> {
    const payTypeDoc = await this.getPayTypeById(id);

    if (payTypeDoc.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        'Can only approve configurations in DRAFT status',
      );
    }

    payTypeDoc.status = ConfigStatus.APPROVED;
    payTypeDoc.approvedBy = new Types.ObjectId(approvedBy);
    payTypeDoc.approvedAt = new Date();
    payTypeDoc.rejectedBy = undefined;
    payTypeDoc.rejectedAt = undefined;
    payTypeDoc.rejectionReason = undefined;

    return payTypeDoc.save();
  }

  async rejectPayType(
    id: string,
    rejectedBy: string,
    reason: string,
  ): Promise<payTypeDocument> {
    const payTypeDoc = await this.getPayTypeById(id);

    if (payTypeDoc.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        'Can only reject configurations in DRAFT status',
      );
    }

    payTypeDoc.status = ConfigStatus.REJECTED;
    payTypeDoc.rejectedBy = new Types.ObjectId(rejectedBy);
    payTypeDoc.rejectedAt = new Date();
    payTypeDoc.rejectionReason = reason;
    payTypeDoc.approvedBy = undefined;
    payTypeDoc.approvedAt = undefined;

    return payTypeDoc.save();
  }

  /* -------------------------------------------------------------------------- */
  /*                               Pay Grades API                               */
  /* -------------------------------------------------------------------------- */

  private validateSalaryRules(
    baseSalary: number,
    grossSalary: number,
  ): void {
    // BR-4: Base salary must be at least 6000 EGP (Egyptian minimum wage)
    if (baseSalary < 6000) {
      throw new BadRequestException(
        'Base salary must be at least 6000 EGP to comply with BR-4 (Egyptian minimum wage)',
      );
    }

    if (grossSalary < baseSalary) {
      throw new BadRequestException(
        'Gross salary must be greater than or equal to base salary',
      );
    }

    // Business rule: grossSalary cannot be more than 10x baseSalary
    if (grossSalary > baseSalary * 10) {
      throw new BadRequestException(
        'Gross salary cannot exceed 10 times the base salary',
      );
    }
  }

  async createPayGrade(
    createDto: CreatePayGradeDto,
  ): Promise<payGradeDocument> {
    try {
      console.log('Attempting to create Pay Grade:', createDto.grade);
      this.validateSalaryRules(createDto.baseSalary, createDto.grossSalary);

      const exists = await this.payGradeModel
        .findOne({ grade: createDto.grade })
        .lean()
        .exec();
      if (exists) {
        throw new ConflictException(
          `Pay grade "${createDto.grade}" already exists`,
        );
      }

      const created = await this.payGradeModel.create({
        ...createDto,
        status: createDto.status || ConfigStatus.DRAFT,
      });
      console.log(`Successfully created Pay Grade: ${created._id}`);
      return created;
    } catch (error) {
      console.error('Error creating pay grade:', error);
      throw new BadRequestException(error.message || 'Failed to create pay grade');
    }
  }

  async getAllPayGrades(
    status?: ConfigStatus,
  ): Promise<payGradeDocument[]> {
    const filter: FilterQuery<payGradeDocument> = {};

    if (status) {
      filter.status = status;
    }

    return this.payGradeModel.find(filter).sort({ grade: 1 }).exec();
  }

  async getPayGradeById(id: string): Promise<payGradeDocument> {
    const payGradeDoc = await this.payGradeModel.findById(id).exec();

    if (!payGradeDoc) {
      throw new NotFoundException(`Pay grade with id ${id} not found`);
    }

    return payGradeDoc;
  }

  async updatePayGrade(
    id: string,
    updateDto: UpdatePayGradeDto,
  ): Promise<payGradeDocument> {
    const payGradeDoc = await this.getPayGradeById(id);

    const baseSalary =
      updateDto.baseSalary ?? payGradeDoc.baseSalary;
    const grossSalary =
      updateDto.grossSalary ?? payGradeDoc.grossSalary;

    this.validateSalaryRules(baseSalary, grossSalary);

    Object.assign(payGradeDoc, updateDto);
    return payGradeDoc.save();
  }

  async deletePayGrade(id: string): Promise<void> {
    try {
      const payGradeDoc = await this.getPayGradeById(id);

      // Validate if pay grade can be deleted (if it's not referenced)
      const canDelete = await this.validateDeletion('payGrade', id);
      if (!canDelete) {
        throw new BadRequestException(
          'Cannot delete pay grade: it is referenced by employees',
        );
      }

      const result = await this.payGradeModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Pay grade with id ${id} not found`);
      }
    } catch (error) {
      console.error('Error deleting pay grade:', error);
      throw error;
    }
  }

  async approvePayGrade(
    id: string,
    approvedBy: string,
  ): Promise<payGradeDocument> {
    const payGradeDoc = await this.getPayGradeById(id);

    if (payGradeDoc.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        'Can only approve configurations in DRAFT status',
      );
    }

    payGradeDoc.status = ConfigStatus.APPROVED;
    payGradeDoc.approvedBy = new Types.ObjectId(approvedBy);
    payGradeDoc.approvedAt = new Date();
    payGradeDoc.rejectedBy = undefined;
    payGradeDoc.rejectedAt = undefined;
    payGradeDoc.rejectionReason = undefined;

    return payGradeDoc.save();
  }

  async rejectPayGrade(
    id: string,
    rejectedBy: string,
    reason: string,
  ): Promise<payGradeDocument> {
    const payGradeDoc = await this.getPayGradeById(id);

    if (payGradeDoc.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        'Can only reject configurations in DRAFT status',
      );
    }

    payGradeDoc.status = ConfigStatus.REJECTED;
    payGradeDoc.rejectedBy = new Types.ObjectId(rejectedBy);
    payGradeDoc.rejectedAt = new Date();
    payGradeDoc.rejectionReason = reason;
    payGradeDoc.approvedBy = undefined;
    payGradeDoc.approvedAt = undefined;

    return payGradeDoc.save();
  }

  /* -------------------------------------------------------------------------- */
  /*                            Payroll Policies API                            */
  /* -------------------------------------------------------------------------- */

  private validateRuleDefinition(
    ruleDefinition: CreatePayrollPolicyDto['ruleDefinition'],
    policyType: PolicyType,
  ): void {
    if (!ruleDefinition) {
      throw new BadRequestException('ruleDefinition is required');
    }

    // Validate that at least one field is provided
    const hasPercentage = ruleDefinition.percentage !== undefined && ruleDefinition.percentage !== null;
    const hasFixedAmount = ruleDefinition.fixedAmount !== undefined && ruleDefinition.fixedAmount !== null;
    const hasThreshold = ruleDefinition.threshold !== undefined && ruleDefinition.threshold !== null;

    if (!hasPercentage && !hasFixedAmount && !hasThreshold) {
      throw new BadRequestException(
        'ruleDefinition must include at least one value (percentage, fixedAmount, or threshold)',
      );
    }

    // Validate percentage range if provided
    if (hasPercentage) {
      const percentage = ruleDefinition.percentage!;
      if (percentage < 0 || percentage > 100) {
        throw new BadRequestException(
          'Percentage must be between 0 and 100',
        );
      }
    }

    // Validate fixedAmount and threshold are non-negative if provided
    if (hasFixedAmount) {
      const fixedAmount = ruleDefinition.fixedAmount!;
      if (fixedAmount < 0) {
        throw new BadRequestException(
          'Fixed amount must be greater than or equal to 0',
        );
      }
    }

    if (hasThreshold) {
      const threshold = ruleDefinition.threshold!;
      if (threshold < 0) {
        throw new BadRequestException(
          'Threshold must be greater than or equal to 0',
        );
      }
    }
  }

  private validateEffectiveDate(effectiveDate: string | Date): void {
    const date = typeof effectiveDate === 'string' ? new Date(effectiveDate) : effectiveDate;

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid effective date');
    }

    // Effective date should not be too far in the past (more than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (date < oneYearAgo) {
      throw new BadRequestException(
        'Effective date cannot be more than 1 year in the past',
      );
    }

    // Effective date should not be too far in the future (more than 5 years)
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);

    if (date > fiveYearsFromNow) {
      throw new BadRequestException(
        'Effective date cannot be more than 5 years in the future',
      );
    }
  }

  async createPayrollPolicy(
    createDto: CreatePayrollPolicyDto,
  ): Promise<payrollPoliciesDocument> {
    try {
      console.log('Attempting to create Payroll Policy:', createDto.policyName);
      // Validate unique constraint manually for better error message
      const exists = await this.payrollPoliciesModel
        .findOne({
          policyName: createDto.policyName,
          policyType: createDto.policyType,
        })
        .lean()
        .exec();

      if (exists) {
        throw new ConflictException(
          `Payroll policy with name "${createDto.policyName}" and type "${createDto.policyType}" already exists`,
        );
      }

      this.validateEffectiveDate(createDto.effectiveDate);
      this.validateRuleDefinition(
        createDto.ruleDefinition,
        createDto.policyType,
      );

      const created = await this.payrollPoliciesModel.create({
        ...createDto,
        effectiveDate: new Date(createDto.effectiveDate),
        status: createDto.status || ConfigStatus.DRAFT,
      });
      console.log(`Successfully created Payroll Policy: ${created._id}`);
      return created;
    } catch (error) {
      console.error('Error creating payroll policy:', error);
      throw new BadRequestException(error.message || 'Failed to create payroll policy');
    }
  }

  async getAllPayrollPolicies(
    policyType?: PolicyType,
    status?: ConfigStatus,
  ): Promise<payrollPoliciesDocument[]> {
    const filter: FilterQuery<payrollPoliciesDocument> = {};

    if (policyType) {
      filter.policyType = policyType;
    }

    if (status) {
      filter.status = status;
    }

    return this.payrollPoliciesModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPayrollPolicyById(
    id: string,
  ): Promise<payrollPoliciesDocument> {
    const policy = await this.payrollPoliciesModel.findById(id).exec();

    if (!policy) {
      throw new NotFoundException(`Payroll policy with id ${id} not found`);
    }

    return policy;
  }

  async updatePayrollPolicy(
    id: string,
    updateDto: UpdatePayrollPolicyDto,
  ): Promise<payrollPoliciesDocument> {
    const policy = await this.getPayrollPolicyById(id);

    // Check for duplicate policyName + policyType combination if either is being updated
    if (updateDto.policyName || updateDto.policyType) {
      const newPolicyName = updateDto.policyName ?? policy.policyName;
      const newPolicyType = updateDto.policyType ?? policy.policyType;

      const exists = await this.payrollPoliciesModel
        .findOne({
          policyName: newPolicyName,
          policyType: newPolicyType,
          _id: { $ne: id },
        })
        .lean()
        .exec();

      if (exists) {
        throw new ConflictException(
          `Payroll policy with name "${newPolicyName}" and type "${newPolicyType}" already exists`,
        );
      }
    }

    // Validate effective date if being updated
    if (updateDto.effectiveDate) {
      this.validateEffectiveDate(updateDto.effectiveDate);
      // Convert string to Date if needed
      if (typeof updateDto.effectiveDate === 'string') {
        updateDto.effectiveDate = new Date(updateDto.effectiveDate) as any;
      }
    }

    // Validate rule definition if being updated
    if (updateDto.ruleDefinition) {
      const policyType = updateDto.policyType ?? policy.policyType;
      this.validateRuleDefinition(updateDto.ruleDefinition, policyType);
    }

    Object.assign(policy, updateDto);
    return policy.save();
  }

  async deletePayrollPolicy(id: string): Promise<void> {
    const policy = await this.getPayrollPolicyById(id);
    const result = await this.payrollPoliciesModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payroll policy with id ${id} not found`);
    }
  }

  async approvePayrollPolicy(
    id: string,
    approvedBy: string,
  ): Promise<payrollPoliciesDocument> {
    const policy = await this.getPayrollPolicyById(id);

    if (policy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        'Can only approve configurations in DRAFT status',
      );
    }

    policy.status = ConfigStatus.APPROVED;
    policy.approvedBy = new Types.ObjectId(approvedBy);
    policy.approvedAt = new Date();
    policy.rejectedBy = undefined;
    policy.rejectedAt = undefined;
    policy.rejectionReason = undefined;

    return policy.save();
  }

  async rejectPayrollPolicy(
    id: string,
    rejectedBy: string,
    reason: string,
  ): Promise<payrollPoliciesDocument> {
    const policy = await this.getPayrollPolicyById(id);

    if (policy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        'Can only reject configurations in DRAFT status',
      );
    }

    policy.status = ConfigStatus.REJECTED;
    policy.rejectedBy = new Types.ObjectId(rejectedBy);
    policy.rejectedAt = new Date();
    policy.rejectionReason = reason;
    policy.approvedBy = undefined;
    policy.approvedAt = undefined;

    return policy.save();
  }

  /* -------------------------------------------------------------------------- */
  /*                               Allowances API                               */
  /* -------------------------------------------------------------------------- */

  async createAllowance(payload: AllowancePayload) {
    try {
      console.log('Attempting to create Allowance:', payload.name);
      const created = await this.allowanceModel.create({
        ...payload,
        createdBy: this.toObjectId(payload.createdBy),
        status: payload.status || ConfigStatus.DRAFT,
      });
      console.log(`Successfully created Allowance: ${created._id}`);
      return created.toObject();
    } catch (error) {
      console.error('Error creating allowance:', error);
      throw new BadRequestException(error.message || 'Failed to create allowance');
    }
  }

  async listAllowances(status?: ConfigStatus) {
    const filter = status ? { status } : {};
    return this.allowanceModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async getAllowance(id: string) {
    return this.findAllowanceOrFail(id);
  }

  async updateAllowance(id: string, payload: Partial<AllowancePayload>) {
    const record = await this.findAllowanceOrFail(id);
    if (payload.name !== undefined) record.name = payload.name;
    if (payload.amount !== undefined) record.amount = payload.amount;
    if (payload.createdBy !== undefined) {
      record.createdBy = this.toObjectId(payload.createdBy);
    }
    return record.save();
  }

  async setAllowanceStatus(id: string, payload: UpdateStatusPayload) {
    const record = await this.findAllowanceOrFail(id);
    this.ensureDraft(record.status, 'Allowance status');
    this.applyStatus(record, payload);
    return record.save();
  }

  async deleteAllowance(id: string): Promise<void> {
    try {
      const objId = this.toObjectId(id.trim());
      console.log(`Attempting to delete Allowance with ID: ${objId}`);
      const result = await this.allowanceModel.findByIdAndDelete(objId).exec();
      if (!result) {
        console.warn(`Allowance with ID ${objId} not found for deletion`);
        throw new NotFoundException('Allowance not found');
      }
      console.log(`Successfully deleted Allowance: ${result._id}`);
    } catch (error) {
      console.error('Error deleting allowance:', error);
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                          Company-wide settings API                         */
  /* -------------------------------------------------------------------------- */

  async upsertCompanyWideSettings(payload: CompanyWideSettingsDto) {
    const existing = await this.companySettingsModel.findOne();
    if (existing) {
      existing.set(payload);
      return existing.save();
    }
    return this.companySettingsModel.create(payload);
  }

  async getCompanyWideSettings(status?: ConfigStatus) {
    const filter = status ? { status } : {};
    return this.companySettingsModel.findOne(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async approveCompanySettings(id: string, approvedBy: string) {
    return this.companySettingsModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.APPROVED,
        approvedBy: this.toObjectId(approvedBy),
        approvedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async rejectCompanySettings(id: string, rejectedBy: string, reason: string) {
    return this.companySettingsModel.findByIdAndUpdate(
      id,
      {
        status: ConfigStatus.REJECTED,
        rejectedBy: this.toObjectId(rejectedBy),
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).exec();
  }

  async updateCompanyWideSettings(id: string, payload: CompanyWideSettingsDto) {
    const updated = await this.companySettingsModel
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Company wide settings entry not found');
    }
    return updated;
  }

  /* -------------------------------------------------------------------------- */
  /*                           Insurance brackets API                           */
  /* -------------------------------------------------------------------------- */

  async createInsuranceBracket(payload: InsurancePayload) {
    try {
      console.log('Attempting to create Insurance Bracket:', payload.name);
      this.ensureSalaryRange(payload.minSalary, payload.maxSalary);
      const created = await this.insuranceModel.create({
        ...payload,

        createdBy: this.toObjectId(payload.createdBy),
        status: payload.status || ConfigStatus.DRAFT,
      });
      console.log(`Successfully created Insurance Bracket: ${created._id}`);
      return created.toObject();
    } catch (error) {
      console.error('Error creating insurance bracket:', error);
      throw new BadRequestException(error.message || 'Failed to create insurance bracket');
    }
  }

  async listInsuranceBrackets(status?: ConfigStatus) {
    const filter = status ? { status } : {};
    return this.insuranceModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async getInsuranceBracket(id: string) {
    return this.findInsuranceOrFail(id);
  }

  async updateInsuranceBracket(id: string, payload: Partial<InsurancePayload>) {
    try {
      const record = await this.findInsuranceOrFail(id);
      if (payload.minSalary !== undefined || payload.maxSalary !== undefined) {
        this.ensureSalaryRange(
          payload.minSalary ?? record.minSalary,
          payload.maxSalary ?? record.maxSalary,
        );
      }
      record.set({
        ...payload,
        createdBy:
          payload.createdBy !== undefined ? this.toObjectId(payload.createdBy) : record.createdBy,
      });
      return await record.save();
    } catch (error) {
      console.error('Error updating insurance bracket:', error);
      throw error;
    }
  }

  async setInsuranceBracketStatus(id: string, payload: UpdateStatusPayload) {
    try {
      const record = await this.findInsuranceOrFail(id);
      this.applyStatus(record, payload);
      return await record.save();
    } catch (error) {
      console.error('Error setting insurance bracket status:', error);
      throw error;
    }
  }

  async deleteInsuranceBracket(id: string) {
    try {
      const objId = this.toObjectId(id.trim());
      console.log(`Attempting to delete Insurance Bracket with ID: ${objId}`);
      const result = await this.insuranceModel.findByIdAndDelete(objId).exec();
      if (!result) {
        console.warn(`Insurance Bracket with ID ${objId} not found for deletion`);
        throw new NotFoundException('Insurance bracket not found');
      }
      console.log(`Successfully deleted Insurance Bracket: ${result._id}`);
    } catch (error) {
      console.error('Error deleting insurance bracket:', error);
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                            Validation Methods                              */
  /* -------------------------------------------------------------------------- */

  /**
   * Validates if a configuration can be deleted.
   * This method will be enhanced later when other modules (Employee, Contracts) are integrated.
   *
   * @param entityType - Type of entity: 'payType', 'payGrade', or 'payrollPolicy'
   * @param id - ID of the entity to validate
   * @returns Promise<boolean> - true if can be deleted, false otherwise
   */
  async validateDeletion(entityType: string, id: string): Promise<boolean> {
    switch (entityType) {
      case 'payType':
        // TODO: Check contract references when Employee module exists
        // For now, allow deletion (return true)
        // When Employee module is integrated, check if any employee contract uses this pay type
        return true;

      case 'payGrade':
        // TODO: Check employee references when Employee module exists
        // For now, allow deletion (return true)
        // When Employee module is integrated, check if any employee has this pay grade assigned
        return true;

      case 'payrollPolicy':
        // TODO: Check if policy is being used by any employee or payroll calculation
        // For now, allow deletion (return true)
        return true;

      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Helpers                                   */
  /* -------------------------------------------------------------------------- */

  private applyStatus(
    entity: { status: ConfigStatus; approvedAt?: Date; approvedBy?: Types.ObjectId },
    payload: UpdateStatusPayload,
  ) {
    if (payload.status === ConfigStatus.DRAFT) {
      throw new BadRequestException('Approval status cannot revert to draft.');
    }
    entity.status = payload.status;
    if (payload.status === ConfigStatus.APPROVED) {
      entity.approvedAt = new Date();
      entity.approvedBy = this.toObjectId(payload.approverId);
    } else {
      entity.approvedAt = undefined;
      entity.approvedBy = undefined;
    }
  }

  private ensureDraft(status: ConfigStatus, context: string) {
    if (status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(`${context} can only be modified while in draft status.`);
    }
  }

  private ensureSalaryRange(min: number, max: number) {
    if (min >= max) {
      throw new BadRequestException('Minimum salary must be less than maximum salary.');
    }
  }

  private async findAllowanceOrFail(id: string) {
    const record = await this.allowanceModel.findById(id).exec();
    if (!record) {
      throw new NotFoundException('Allowance not found');
    }
    return record;
  }

  private async findInsuranceOrFail(id: string) {
    const record = await this.insuranceModel.findById(id).exec();
    if (!record) {
      throw new NotFoundException('Insurance bracket not found');
    }
    return record;
  }

  private toObjectId(id?: string) {
    return id ? new Types.ObjectId(id) : undefined;
  }
}
