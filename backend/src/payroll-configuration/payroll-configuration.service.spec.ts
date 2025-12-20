import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConfigStatus } from './enums/payroll-configuration-enums';
import { allowance } from './Models/allowance.schema';
import { CompanyWideSettings } from './Models/CompanyWideSettings.schema';
import { insuranceBrackets } from './Models/insuranceBrackets.schema';
import { PayrollConfigurationService } from './payroll-configuration.service';

const createDoc = <T extends Record<string, any>>(data: T) => {
  const document: Record<string, any> = { ...data };
  document.save = jest.fn().mockResolvedValue(document);
  document.set = jest.fn((values: Partial<T>) => Object.assign(document, values));
  document.toObject = jest.fn(() => ({ ...document }));
  return document as T & { save: jest.Mock; set: jest.Mock; toObject: jest.Mock };
};

const createExecResult = (value: any) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('PayrollConfigurationService', () => {
  let service: PayrollConfigurationService;
  let allowanceModel: any;
  let companySettingsModel: any;
  let insuranceModel: any;

  beforeEach(async () => {
    allowanceModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    companySettingsModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    insuranceModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        PayrollConfigurationService,
        { provide: getModelToken(allowance.name), useValue: allowanceModel },
        { provide: getModelToken(CompanyWideSettings.name), useValue: companySettingsModel },
        { provide: getModelToken(insuranceBrackets.name), useValue: insuranceModel },
      ],
    }).compile();

    service = module.get(PayrollConfigurationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates allowances in draft state with ObjectId creator', async () => {
    allowanceModel.create.mockImplementation(async (payload: any) => payload);
    await service.createAllowance({ name: 'Transport', amount: 2500, createdBy: new Types.ObjectId().toHexString() });

    expect(allowanceModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Transport',
        amount: 2500,
        status: ConfigStatus.DRAFT,
        createdBy: expect.any(Types.ObjectId),
      }),
    );
  });

  it('updates allowance fields only when status is draft', async () => {
    const doc = createDoc({ _id: 'a1', status: ConfigStatus.DRAFT, name: 'wld', amount: 1000 });
    allowanceModel.findById.mockReturnValue(createExecResult(doc));

    await service.updateAllowance('a1', { amount: 1500 });

    expect(doc.amount).toBe(1500);
    expect(doc.save).toHaveBeenCalled();
  });

  it('rejects allowance updates when status is not draft', async () => {
    const doc = createDoc({ _id: 'a2', status: ConfigStatus.APPROVED });
    allowanceModel.findById.mockReturnValue(createExecResult(doc));

    await expect(service.updateAllowance('a2', { amount: 1700 })).rejects.toThrow(BadRequestException);
  });

  it('approves allowances and stamps approver info', async () => {
    const doc = createDoc({
      _id: 'a3',
      status: ConfigStatus.DRAFT,
      approvedAt: undefined,
      approvedBy: undefined,
    });
    allowanceModel.findById.mockReturnValue(createExecResult(doc));

    await service.setAllowanceStatus('a3', { status: ConfigStatus.APPROVED, approverId: new Types.ObjectId().toHexString() });

    expect(doc.status).toBe(ConfigStatus.APPROVED);
    expect(doc.approvedBy).toBeInstanceOf(Types.ObjectId);
    expect(doc.approvedAt).toBeInstanceOf(Date);
    expect(doc.save).toHaveBeenCalled();
  });

  it('creates company settings when none exists', async () => {
    companySettingsModel.findOne.mockResolvedValue(null);
    companySettingsModel.create.mockResolvedValue({ payDate: new Date() });

    await service.upsertCompanyWideSettings({ timeZone: 'Africa/Cairo' });

    expect(companySettingsModel.create).toHaveBeenCalledWith({ timeZone: 'Africa/Cairo' });
  });

  it('updates existing company settings via upsert', async () => {
    const existing = createDoc({ payDate: new Date('2025-01-01') });
    companySettingsModel.findOne.mockResolvedValue(existing);

    await service.upsertCompanyWideSettings({ timeZone: 'UTC' });

    expect(existing.set).toHaveBeenCalledWith({ timeZone: 'UTC' });
    expect(existing.save).toHaveBeenCalled();
  });

  it('rejects insurance bracket creation when salary range is invalid', async () => {
    await expect(
      service.createInsuranceBracket({
        name: 'Invalid',
        amount: 200,
        minSalary: 5000,
        maxSalary: 3000,
        employeeRate: 5,
        employerRate: 10,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(insuranceModel.create).not.toHaveBeenCalled();
  });

  it('prevents insurance bracket updates that break salary range validation', async () => {
    const doc = createDoc({
      _id: 'ins1',
      status: ConfigStatus.DRAFT,
      minSalary: 0,
      maxSalary: 1000,
    });
    insuranceModel.findById.mockReturnValue(createExecResult(doc));

    await expect(
      service.updateInsuranceBracket('ins1', {
        minSalary: 2000,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
