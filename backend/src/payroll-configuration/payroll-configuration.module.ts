import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';

// Schemas (from your payrollModels folder)
import { allowance, allowanceSchema } from './Models/allowance.schema';
import { signingBonus, signingBonusSchema } from './Models/SigningBonus.schema';
import { taxRules, taxRulesSchema } from './Models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsSchema } from './Models/insuranceBrackets.schema';
import { payType, payTypeSchema } from './Models/PayType.schema';
import { payrollPolicies, payrollPoliciesSchema } from './Models/payrollPolicies.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from './Models/terminationAndResignationBenefits';
import { CompanyWideSettings, CompanyWideSettingsSchema } from './Models/CompanyWideSettings.schema';
import { payGrade, payGradeSchema } from './Models/payGrades.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payGradeSchema },
    ]),
  ],
  controllers: [PayrollConfigurationController],
  providers: [PayrollConfigurationService],
  exports: [PayrollConfigurationService],
})
export class PayrollConfigurationModule { }
