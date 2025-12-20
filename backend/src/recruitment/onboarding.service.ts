import { createOnboardingDto } from './dto/createonboarding.dto';
import {OnboardingDocument,Onboarding} from './Models/onboarding.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ContractTpEmployeeDto } from './dto/contractToEmployee.dto';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { Contract,ContractDocument } from './Models/contract.schema';
import { ViewTrackerDto } from './dto/viewTracker.dto';
import { DocumentDocument } from './Models/document.schema';
import { UploadDocumentDto } from './dto/uploadDocument.dto';
import { Document } from './Models/document.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { contractToPayrolldto } from './dto/contractToPayroll.dto';
import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service';
import { RegisterEmployeeDto } from '../employee-profile/dto/register-employee.dto';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { Offer, OfferDocument } from './Models/offer.schema';
import { NotificationsService } from '../leaves/notifications/notifications.service';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { Types } from 'mongoose';
import EmailService from './email.service';



@Injectable()
export class ONboardingRecruitmentService {

  constructor(
    @InjectModel(Onboarding.name)
    private readonly onboardingModel: Model<OnboardingDocument>,
    @InjectModel(Contract.name)
    private readonly ContractModel: Model<ContractDocument>,
    @InjectModel(Document.name)
    private readonly documentModel: Model<DocumentDocument>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly notificationService: NotificationsService,
    private readonly payrollExecutionService: PayrollExecutionService,
    private readonly emailService: EmailService
  ) {}

  async createRecruitmentonboard(
    onboardingdata: createOnboardingDto
  ): Promise<any> {
  
    // 1️⃣ Find offer using candidateId
    console.log(onboardingdata)
    const offer = await this.offerModel.findOne({
      candidateId: onboardingdata.employeeId, // no ObjectId conversion
    });
    
  
    if (!offer) {
      throw new NotFoundException('Offer not found for this candidate');
    }
  
    // 2️⃣ Find contract using offerId
    const contract = await this.ContractModel.findOne({
      offerId: offer._id,
    });
  
    if (!contract) {
      throw new NotFoundException('Contract not found for this offer');
    }
  
    // 3️⃣ Attach contractId to onboarding data

    onboardingdata.contractId = contract._id;
  
    // 4️⃣ Add static task
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
  
    const staticTask = {
      name: 'Set up email',
      department: 'IT',
      status: OnboardingTaskStatus.PENDING,
      deadline: oneWeekLater,
      completedAt: null,
      documentId: null,
      notes: null,
    };
  
    onboardingdata.tasks.push(staticTask);
  
    // 5️⃣ Create onboarding record
    const onboarding = new this.onboardingModel(onboardingdata);
    const savedOnboarding = await onboarding.save();
  
    // 6️⃣ Notify departments
    await this.notifyIT(onboardingdata.employeeId);
    await this.notifyAdmin(onboardingdata.employeeId);
    await this.notifyEmployee(onboardingdata.employeeId);
  
    return savedOnboarding;
  }
// Mark all tasks in an onboarding as completed
async completeOnBoard(onboardingId: string): Promise<any> {
  if (!onboardingId) throw new Error('Onboarding ID is required');

  // Update the parent onboarding document and all tasks inside
  const updated = await this.onboardingModel.findByIdAndUpdate(
    onboardingId,
    {
      completed: true,
      completedAt: new Date(),
      $set: {
        'tasks.$[].status': 'COMPLETED', // update all child tasks status
        'tasks.$[].completedAt': new Date(), // update all child tasks completedAt
      },
    },
    { new: true } // return the updated document
  );

  if (!updated) throw new Error('Onboarding not found');
  console.log(`updated`)
  return ;
}

  
  async getOnboard(): Promise<any>{
    return this.onboardingModel.find();
  }

  //need more inputs or diff implemention
  //
  async registerNewEmployee(contractData: ContractTpEmployeeDto): Promise<any> {
    // 1️⃣ Find the onboarding record or offer for this employee
    const offer = await this.offerModel.findOne({
      candidateId: new Types.ObjectId(contractData.employeeId),
    });
    if (!offer) {
      throw new NotFoundException('Offer not found for this candidate');
    }
  
    // 2️⃣ Find the contract associated with this offer
    const contract = await this.ContractModel.findOne({ offerId: offer._id }).exec();
    if (!contract) throw new Error('Contract not found');
  
    // 3️⃣ Build RegisterEmployeeDto from contract & offer
    // const registerDto: RegisterEmployeeDto = {
    //   firstName: contract.role || 'Employee',
    //   lastName: 'User',
    //   nationalId: `EMP-${contract._id}`,
    //   password: 'changeme123',
    //   dateOfHire: contract.acceptanceDate?.toISOString() || new Date().toISOString(),
    //   roles: [SystemRole.HR_EMPLOYEE], // adjust as needed
    // };
  
    // // 4️⃣ Create the employee profile
    // const newEmployee = await this.employeeProfileService.createEmployee(registerDto);
    console.log(`user contract ${contract}`);
    return ;
  }
  
  

  async viewTracker(employeeId: string): Promise<ViewTrackerDto> {
    console.log(employeeId)
    const record = await this.onboardingModel.findOne({ employeeId });
  
    if (!record) {
      return { tasks: [] };
    }
    return { tasks: record.tasks };
    
  }

  async uploadDocument(dto: UploadDocumentDto): Promise<any> {
    const document = new this.documentModel(dto);
    const savedDocument = await document.save();
    return savedDocument;
  }
  async notifyEmployee(employeeId: string): Promise<any> {
    const tasks = await this.viewTracker(employeeId);
    const employee = await this.employeeProfileService.getEmployee(employeeId, "HR_MANAGER");
  
    console.log('Tasks:', tasks);
  
    if (tasks.tasks.length > 0) {
      for (const task of tasks.tasks) {
        // Create notification for each task
        await this.notificationService.create({
          title: 'New Onboarding Task',
          message: `You have a new onboarding task: ${task.name}`,
          receiverId: employee._id.toString(), // must be string
        });
  
        console.log(
          `Notification sent for task: ${task.name}, deadline: ${task.deadline}, status: ${task.status}`
        );
      }
    }
  
    return { message: 'Employee notified' };
  }
  
  async notifyIT(employeeId: string): Promise<any> {
    const tasks = await this.viewTracker(employeeId);
  
    if (tasks.tasks.length > 0) {
      for (const task of tasks.tasks) {
        if (task.department === 'IT') {
          // Call your NotificationsService to create a notification
          await this.notificationService.create({
            title: 'New IT Onboarding Task',
            message: `You have a new IT onboarding task: ${task.name}`,
            receiverId: employeeId, // employee assigned to task
          });
  
          console.log(
            `IT Notification sent → Task: ${task.name}, Deadline: ${task.deadline}, Status: ${task.status}`
          );
        }
      }
    }
  
    console.log('IT notified');
    return { message: 'IT notified' };
  }
  

  async notifyAdmin(employeeId: string): Promise<any> {
    const tasks = await this.viewTracker(employeeId);
    const employee = await this.employeeProfileService.getEmployee(employeeId, "HR_MANAGER");
  
    if (tasks.tasks.length > 0) {
      for (const task of tasks.tasks) {
        if (task.department === 'Admin') {
          // Send a notification via NotificationsService
          await this.notificationService.create({
            title: 'New Admin Onboarding Task',
            message: `You have a new Admin onboarding task: ${task.name}`,
            receiverId: employee._id.toString(), // Make sure this is a string if your DTO expects string
          });
  
          console.log(
            `Admin Notification sent → Task: ${task.name}, Deadline: ${task.deadline}, Status: ${task.status}`
          );
        }
      }
    }
  
    console.log('Admin notified');
    return { message: 'Admin notified' };
  }
  
  async payrollInit(employeeId:string,contractdata:contractToPayrolldto): Promise<any> {
    const contractId = contractdata.contractId;
    const contract = this.ContractModel.findOne({contractId});
    if (!contract) {
      throw new Error('Contract not found');
    }
    const payrollData = {
      employeeId: employeeId,
      contractId: contractdata.contractId,
      grossSalary: contractdata.grossSalary,
      role: contractdata.role,
      startDate: contractdata.acceptanceDate,
    };
    //the payroll exec func implemtion
    
    //await this.payrollExecutionService.initiatePayrollPeriod(payrollData);
      console.log(`Payroll initialized for employee ${payrollData.employeeId} with contract ${payrollData.contractId}`);
     return console.log(`payroll ${payrollData} initialized`);
    }
    
    async addSigningBonus(contractData: contractToPayrolldto): Promise<any> {
      if (!contractData.signingBonus) {
        throw new Error('contractId is required to process signing bonus');
      }
    
     // return await this.payrollExecutionService.updateSigningBonusStatus(contractData.signingBonus,'PENDING');
      return 
    }
    
    

}