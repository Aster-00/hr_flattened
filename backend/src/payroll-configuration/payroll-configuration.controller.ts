import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigStatus, PolicyType } from './enums/payroll-configuration-enums';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { Types } from 'mongoose';
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
import {
  ApproveConfigDto,
  RejectConfigDto,
  ApprovalDto,
} from './dto/approval.dto';
import { CreateAllowanceDto, UpdateAllowanceDto } from './dto/allowance';
import { CreateSigningBonusDto, UpdateSigningBonusDto } from './dto/signing-bonus';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/tax-rule';
import { CreateTerminationBenefitDto, UpdateTerminationBenefitDto } from './dto/termination-benefit';
import { CreateInsuranceBracketDto, UpdateInsuranceBracketDto } from './dto/insurance-bracket';
import { CompanyWideSettingsDto } from './dto/company-settings';



@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigurationService: PayrollConfigurationService,
  ) { }

  @Get('health')
  healthCheck() {
    return { status: 'ok', message: 'Payroll Configuration API is running' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               Signing Bonus API                            */
  /* -------------------------------------------------------------------------- */

  @Post('signing-bonus')
  createSigningBonus(@Body() dto: CreateSigningBonusDto) {
    return this.payrollConfigurationService.createSigningBonus(dto);
  }

  @Patch('signing-bonus/:id')
  updateSigningBonus(@Param('id') id: string, @Body() dto: UpdateSigningBonusDto) {
    return this.payrollConfigurationService.updateSigningBonus(id, dto);
  }

  @Get('signing-bonus')
  getAllSigningBonus(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.getAllSigningBonus(status);
  }

  @Get('signing-bonus/:id')
  getOneSigningBonus(@Param('id') id: string) {
    return this.payrollConfigurationService.getOneSigningBonus(id);
  }

  @Delete('signing-bonus/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSigningBonus(@Param('id') id: string): Promise<void> {
    return this.payrollConfigurationService.deleteSigningBonus(id);
  }

  @Post('signing-bonus/:id/approve')
  approveSigningBonus(@Param('id') id: string, @Body() dto: ApproveConfigDto) {
    return this.payrollConfigurationService.approveSigningBonus(id, dto.approvedBy);
  }

  @Post('signing-bonus/:id/reject')
  rejectSigningBonus(@Param('id') id: string, @Body() dto: RejectConfigDto) {
    return this.payrollConfigurationService.rejectSigningBonus(id, dto.rejectedBy, dto.reason);
  }

  /* -------------------------------------------------------------------------- */
  /*                               Tax Rules API                                */
  /* -------------------------------------------------------------------------- */

  @Post('tax-rule')
  createTaxRule(@Body() dto: CreateTaxRuleDto) {
    return this.payrollConfigurationService.createTaxRule(dto);
  }

  @Patch('tax-rule/:id')
  updateTaxRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto) {
    return this.payrollConfigurationService.updateTaxRule(id, dto);
  }

  @Get('tax-rule')
  getAllTaxRules(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.getAllTaxRules(status);
  }

  @Get('tax-rule/:id')
  getOneTaxRule(@Param('id') id: string) {
    return this.payrollConfigurationService.getOneTaxRule(id);
  }

  @Delete('tax-rule/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTaxRule(@Param('id') id: string): Promise<void> {
    return this.payrollConfigurationService.deleteTaxRule(id);
  }

  @Post('tax-rule/:id/approve')
  approveTaxRule(@Param('id') id: string, @Body() dto: ApproveConfigDto) {
    return this.payrollConfigurationService.approveTaxRule(id, dto.approvedBy);
  }

  @Post('tax-rule/:id/reject')
  rejectTaxRule(@Param('id') id: string, @Body() dto: RejectConfigDto) {
    return this.payrollConfigurationService.rejectTaxRule(id, dto.rejectedBy, dto.reason);
  }

  /* -------------------------------------------------------------------------- */
  /*                          Termination Benefits API                          */
  /* -------------------------------------------------------------------------- */

  @Post('termination-benefit')
  createTerminationBenefit(@Body() dto: CreateTerminationBenefitDto) {
    return this.payrollConfigurationService.createTerminationBenefit(dto);
  }

  @Patch('termination-benefit/:id')
  updateTerminationBenefit(@Param('id') id: string, @Body() dto: UpdateTerminationBenefitDto) {
    return this.payrollConfigurationService.updateTerminationBenefit(id, dto);
  }

  @Get('termination-benefit')
  getAllTerminationBenefits(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.getAllTerminationBenefits(status);
  }

  @Get('termination-benefit/:id')
  getOneTerminationBenefit(@Param('id') id: string) {
    return this.payrollConfigurationService.getOneTerminationBenefit(id);
  }

  @Delete('termination-benefit/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTerminationBenefit(@Param('id') id: string): Promise<void> {
    return this.payrollConfigurationService.deleteTerminationBenefit(id);
  }

  @Post('termination-benefit/:id/approve')
  approveTerminationBenefit(@Param('id') id: string, @Body() dto: ApproveConfigDto) {
    return this.payrollConfigurationService.approveTerminationBenefit(id, dto.approvedBy);
  }

  @Post('termination-benefit/:id/reject')
  rejectTerminationBenefit(@Param('id') id: string, @Body() dto: RejectConfigDto) {
    return this.payrollConfigurationService.rejectTerminationBenefit(id, dto.rejectedBy, dto.reason);
  }

  /* -------------------------------------------------------------------------- */
  /*                               Pay Types API                                */
  /* -------------------------------------------------------------------------- */

  @Post('pay-types')
  async createPayType(@Body() createDto: CreatePayTypeDto) {
    return this.payrollConfigurationService.createPayType(createDto);
  }

  @Get('pay-types')
  async getAllPayTypes(@Query('status') status?: string) {
    return this.payrollConfigurationService.getAllPayTypes(status as ConfigStatus);
  }

  @Get('pay-types/:id')
  async getPayTypeById(@Param('id') id: string) {
    return this.payrollConfigurationService.getPayTypeById(id);
  }

  @Patch('pay-types/:id')
  async updatePayType(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayTypeDto,
  ) {
    return this.payrollConfigurationService.updatePayType(id, updateDto);
  }

  @Delete('pay-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayType(@Param('id') id: string): Promise<void> {
    await this.payrollConfigurationService.deletePayType(id);
  }

  @Post('pay-types/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayType(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approvePayType(
      id,
      approveDto.approvedBy,
    );
  }

  @Post('pay-types/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPayType(
    @Param('id') id: string,
    @Body() rejectDto: RejectConfigDto,
  ) {
    return this.payrollConfigurationService.rejectPayType(
      id,
      rejectDto.rejectedBy,
      rejectDto.reason,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                            Payroll Policies API                            */
  /* -------------------------------------------------------------------------- */

  @Post('payroll-policies')
  async createPayrollPolicy(@Body() createDto: CreatePayrollPolicyDto) {
    return this.payrollConfigurationService.createPayrollPolicy(createDto);
  }

  @Get('payroll-policies')
  async getAllPayrollPolicies(
    @Query('policyType') policyType?: PolicyType,
    @Query('status') status?: ConfigStatus,
  ) {
    return this.payrollConfigurationService.getAllPayrollPolicies(
      policyType,
      status,
    );
  }

  @Get('payroll-policies/:id')
  async getPayrollPolicyById(@Param('id') id: string) {
    return this.payrollConfigurationService.getPayrollPolicyById(id);
  }

  @Patch('payroll-policies/:id')
  async updatePayrollPolicy(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayrollPolicyDto,
  ) {
    return this.payrollConfigurationService.updatePayrollPolicy(id, updateDto);
  }

  @Delete('payroll-policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayrollPolicy(@Param('id') id: string): Promise<void> {
    await this.payrollConfigurationService.deletePayrollPolicy(id);
  }

  @Post('payroll-policies/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayrollPolicy(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approvePayrollPolicy(
      id,
      approveDto.approvedBy,
    );
  }

  @Post('payroll-policies/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPayrollPolicy(
    @Param('id') id: string,
    @Body() rejectDto: RejectConfigDto,
  ) {
    return this.payrollConfigurationService.rejectPayrollPolicy(
      id,
      rejectDto.rejectedBy,
      rejectDto.reason,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               Pay Grades API                               */
  /* -------------------------------------------------------------------------- */

  @Post('pay-grades')
  async createPayGrade(@Body() createDto: CreatePayGradeDto) {
    return this.payrollConfigurationService.createPayGrade(createDto);
  }

  @Get('pay-grades')
  async getAllPayGrades(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.getAllPayGrades(status);
  }

  @Get('pay-grades/:id')
  async getPayGradeById(@Param('id') id: string) {
    return this.payrollConfigurationService.getPayGradeById(id);
  }

  @Patch('pay-grades/:id')
  async updatePayGrade(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayGradeDto,
  ) {
    return this.payrollConfigurationService.updatePayGrade(id, updateDto);
  }

  @Delete('pay-grades/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayGrade(@Param('id') id: string): Promise<void> {
    await this.payrollConfigurationService.deletePayGrade(id);
  }

  @Post('pay-grades/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayGrade(
    @Param('id') id: string,
    @Body() approveDto: ApproveConfigDto,
  ) {
    return this.payrollConfigurationService.approvePayGrade(
      id,
      approveDto.approvedBy,
    );
  }

  @Post('pay-grades/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPayGrade(
    @Param('id') id: string,
    @Body() rejectDto: RejectConfigDto,
  ) {
    return this.payrollConfigurationService.rejectPayGrade(
      id,
      rejectDto.rejectedBy,
      rejectDto.reason,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               Allowances API                               */
  /* -------------------------------------------------------------------------- */

  @Post('allowances')
  createAllowance(@Body() body: CreateAllowanceDto) {
    return this.payrollConfigurationService.createAllowance(body);
  }

  @Get('allowances')
  listAllowances(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.listAllowances(status);
  }

  @Get('allowances/:id')
  getAllowance(@Param('id') id: string) {
    return this.payrollConfigurationService.getAllowance(id);
  }

  @Patch('allowances/:id')
  updateAllowance(
    @Param('id') id: string,
    @Body() body: UpdateAllowanceDto,
  ) {
    return this.payrollConfigurationService.updateAllowance(
      id,
      body,
    );
  }

  @Patch('allowances/:id/status')
  approveAllowance(
    @Param('id') id: string,
    @Body() body: ApprovalDto,
  ) {
    return this.payrollConfigurationService.setAllowanceStatus(
      id,
      body,
    );
  }

  @Delete('allowances/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAllowance(@Param('id') id: string): Promise<void> {
    return this.payrollConfigurationService.deleteAllowance(id);
  }

  /* -------------------------------------------------------------------------- */
  /*                          Company-wide settings API                         */
  /* -------------------------------------------------------------------------- */

  @Post('company-settings')
  upsertCompanySettings(@Body() body: CompanyWideSettingsDto) {
    return this.payrollConfigurationService.upsertCompanyWideSettings(body);
  }

  @Get('company-settings')
  getCompanySettings(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.getCompanyWideSettings(status);
  }

  @Post('company-settings/:id/approve')
  approveCompanySettings(@Param('id') id: string, @Body() dto: ApproveConfigDto) {
    return this.payrollConfigurationService.approveCompanySettings(id, dto.approvedBy);
  }

  @Post('company-settings/:id/reject')
  rejectCompanySettings(@Param('id') id: string, @Body() dto: RejectConfigDto) {
    return this.payrollConfigurationService.rejectCompanySettings(id, dto.rejectedBy, dto.reason);
  }

  @Patch('company-settings/:id')
  updateCompanySettings(
    @Param('id') id: string,
    @Body() body: CompanyWideSettingsDto,
  ) {
    return this.payrollConfigurationService.updateCompanyWideSettings(
      id,
      body,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                           Insurance brackets API                           */
  /* -------------------------------------------------------------------------- */

  @Post('insurance-brackets')
  createInsurance(@Body() body: CreateInsuranceBracketDto) {
    return this.payrollConfigurationService.createInsuranceBracket(body);
  }

  @Get('insurance-brackets')
  listInsurance(@Query('status') status?: ConfigStatus) {
    return this.payrollConfigurationService.listInsuranceBrackets(status);
  }

  @Get('insurance-brackets/:id')
  getInsurance(@Param('id') id: string) {
    return this.payrollConfigurationService.getInsuranceBracket(id);
  }

  @Patch('insurance-brackets/:id')
  updateInsurance(
    @Param('id') id: string,
    @Body() body: UpdateInsuranceBracketDto,
  ) {
    return this.payrollConfigurationService.updateInsuranceBracket(
      id,
      body,
    );
  }

  @Patch('insurance-brackets/:id/status')
  approveInsurance(
    @Param('id') id: string,
    @Body() body: ApprovalDto,
  ) {
    return this.payrollConfigurationService.setInsuranceBracketStatus(
      id,
      body,
    );
  }

  @Delete('insurance-brackets/:id')
  deleteInsurance(@Param('id') id: string) {
    return this.payrollConfigurationService.deleteInsuranceBracket(
      id,
    );
  }
}
