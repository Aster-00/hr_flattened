import { Test, TestingModule } from '@nestjs/testing';
import { PayrollExecutionService } from './payroll-execution.service';
import { getModelToken } from '@nestjs/mongoose';
import { payrollRuns } from './Models/payrollRuns.schema';
import { paySlip } from './Models/payslip.schema';
import { employeeSigningBonus } from './Models/EmployeeSigningBonus.schema';
import { terminationAndResignationBenefits } from '../payroll-configuration/Models/terminationAndResignationBenefits';
import { employeePenalties } from './Models/employeePenalties.schema';

describe('PayrollExecutionService', () => {
  let service: PayrollExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollExecutionService,
        { provide: getModelToken(payrollRuns.name), useValue: {} },
        { provide: getModelToken(paySlip.name), useValue: {} },
        { provide: getModelToken('EmployeeProfile'), useValue: {} },
        { provide: getModelToken(employeeSigningBonus.name), useValue: {} },
        { provide: getModelToken(terminationAndResignationBenefits.name), useValue: {} },
        { provide: getModelToken(employeePenalties.name), useValue: {}},
      ],
    }).compile();

    service = module.get<PayrollExecutionService>(PayrollExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
