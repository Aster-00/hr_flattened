import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import {createOnboardingDto} from './dto/createonboarding.dto';
import {ContractTpEmployeeDto } from './dto/contractToEmployee.dto';
import { ONboardingRecruitmentService} from './onboarding.service';
import { ViewTrackerDto } from './dto/viewTracker.dto';
import { UploadDocumentDto } from './dto/uploadDocument.dto';
import { contractToPayrolldto } from './dto/contractToPayroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ONRecruitmentController {
  constructor(private readonly recruitmentService: ONboardingRecruitmentService) {}

  @Post('/onboard')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.HR_ADMIN)
  async createRecruitmentonboard(@Body() dto: createOnboardingDto) {
    const onboardingtasks = await this.recruitmentService.createRecruitmentonboard(dto);
    console.log('Onboarding Tasks Created:', onboardingtasks);
    return true;
  }
  @Get('/onboard')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.HR_ADMIN)
  async getOnboard(){
    const onboardingtasks =  await this.recruitmentService.getOnboard();
    console.log("task fetched")
    return onboardingtasks;
  }
  @Put('onboard/:taskId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.HR_ADMIN)
  async updateTaskComplition(@Param('taskId') taskId: string): Promise <any>{
    const taskUpdate = await this.recruitmentService.completeOnBoard(taskId);
    return ;
  }


  @Post('/newEmployee')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.HR_ADMIN)
  async registerNewEmployee(@Body() contractdto: ContractTpEmployeeDto) { 
    const newEmployee = await this.recruitmentService.registerNewEmployee(contractdto);
    console.log('New Employee Registered:', newEmployee);
    return newEmployee;
  }

  @Get('/viewTracker/:EmployeeId')
  @Roles(SystemRole.SYSTEM_ADMIN,SystemRole.JOB_CANDIDATE, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE)
  async viewTracker(@Param('EmployeeId') employeeId: string): Promise<ViewTrackerDto> {
  return this.recruitmentService.viewTracker(employeeId);
  }

  @Post('/uploadDocument')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto
  ) {
    if (!file) {
      throw new Error('File is required');
    }
  
    // Populate filePath for Mongoose
    dto.filePath = file.path;
  
    // Now call service
    const document = await this.recruitmentService.uploadDocument(dto);
    console.log('Document Uploaded:', document);
    return document;
  }
  

  @Post('/notifyEmployee/:EmployeeId')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.HR_ADMIN)
  async notifyEmployee(@Param('EmployeeId') employeeId: string) {
    return this.recruitmentService.notifyEmployee(employeeId);
  }

  @Post('/pay-init/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER)
  async payrollInit(@Param('id')id:string, @Body() dto: contractToPayrolldto) {

    return this.recruitmentService.payrollInit(id, dto);
    
  }
  @Post('/pay-signBonus/')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER)
  async addSigningBonus(@Body() dto: contractToPayrolldto) {
    return this.recruitmentService.addSigningBonus(dto);
  }





}
