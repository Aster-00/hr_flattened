import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { EmailService } from './email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTemplate, JobTemplateSchema } from './Models/job-template.schema';
import { JobRequisition, JobRequisitionSchema } from './Models/job-requisition.schema';
import { Application, ApplicationSchema } from './Models/application.schema';
import { ApplicationStatusHistory, ApplicationStatusHistorySchema } from './Models/application-history.schema';
import { Interview, InterviewSchema } from './Models/interview.schema';
import { AssessmentResult, AssessmentResultSchema } from './Models/assessment-result.schema';
import { Referral, ReferralSchema } from './Models/referral.schema';
import { Offer, OfferSchema } from './Models/offer.schema';
import { Contract, ContractSchema } from './Models/contract.schema';
import { Document, DocumentSchema } from './Models/document.schema';
import { TerminationRequest, TerminationRequestSchema } from './Models/termination-request.schema';
import { ClearanceChecklist, ClearanceChecklistSchema } from './Models/clearance-checklist.schema';
import { Onboarding, OnboardingSchema } from './Models/onboarding.schema';
import { Candidate, CandidateSchema } from '../employee-profile/Models/candidate.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/Models/employee-profile.schema';
import { NotificationLog, NotificationLogSchema } from '../time-management/Models/notification-log.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { NotificationsService } from '../leaves/notifications/notifications.service';
import { LeavesModule } from '../leaves/leaves.module';
import { ONRecruitmentController } from './onboarding.controller';
import { ONboardingRecruitmentService } from './onboarding.service';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: JobTemplate.name, schema: JobTemplateSchema },
    { name: JobRequisition.name, schema: JobRequisitionSchema },
    { name: Application.name, schema: ApplicationSchema },
    { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
    { name: Interview.name, schema: InterviewSchema },
    { name: AssessmentResult.name, schema: AssessmentResultSchema },
    { name: Referral.name, schema: ReferralSchema },
    { name: Offer.name, schema: OfferSchema },
    { name: Contract.name, schema: ContractSchema },
    { name: Document.name, schema: DocumentSchema },
    { name: TerminationRequest.name, schema: TerminationRequestSchema },
    { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
    { name: Onboarding.name, schema: OnboardingSchema },
    { name: Candidate.name, schema: CandidateSchema },
    { name: EmployeeProfile.name, schema: EmployeeProfileSchema }, // EmployeeProfile model for panel members
    { name: NotificationLog.name, schema: NotificationLogSchema },
  ]), EmployeeProfileModule, LeavesModule,PayrollExecutionModule,
  ],
  controllers: [RecruitmentController, OffboardingController,ONRecruitmentController],
  providers: [RecruitmentService, NotificationsService,ONboardingRecruitmentService ,OffboardingService, EmailService],
  exports: [RecruitmentService, OffboardingService,ONboardingRecruitmentService, EmailService]
})
export class RecruitmentModule { }
