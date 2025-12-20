import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Patch,
    Req,
    Query,
} from '@nestjs/common';
//import { CreateEmployeeDto } from './dto/create-employee.dto';

import { EmployeeProfileService } from './employee-profile.service';
import { UpdateEmployeeAdminDto } from './dto/update-employee-admin.dto';
import { UpdateEmployeeSelfImmediateDto } from './dto/update-self-immediate.dto';
import { CreateEmployeeChangeRequestDto } from './dto/create-change-request.dto';
import { CreateLegalChangeRequestDto } from './dto/create-legal-change-request.dto';
// import { ReviewChangeRequestDto } from './dto/';
import { ProfileChangeStatus } from './enums/employee-profile.enums';

import { ReviewChangeRequestDto } from './dto/review-change-request.dto';

import { SystemRole } from './enums/employee-profile.enums';
import { RegisterEmployeeDto } from './dto/register-employee.dto';

import { Roles } from '../auth/decorator/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto';
import { EmployeeSystemRole } from './Models/employee-system-role.schema';

@Controller('employee-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeProfileController {
    constructor(private readonly svc: EmployeeProfileService) { }
    //---------------------
    // '/employee-profile'
    //---------------------
    @Post()
    //@Roles(SystemRole.HR_MANAGER)
    createEmployee(@Body() dto: RegisterEmployeeDto) {
        return this.svc.createEmployee(dto);
    }

    //get all employees
    @Get()
    @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.DEPARTMENT_HEAD)
    getAll(@Req() req) {
        return this.svc.getAllEmployees(req.user);
    }

    //-------------------------------
    // '/employee-profile/candidate'
    //-------------------------------

    // NestJS example
    @Get('me')
    @Roles() // Requires authentication but allows any authenticated user
    getMe(@Req() req) {
        // req.cookies.employeeNumber is available if using cookie-parser
        const employeeNumber = req.cookies.employeeNumber;
        return this.svc.getMyProfile(employeeNumber, req.user);
    }

    @Get('myrole')
    @Roles() // Empty @Roles() triggers JWT auth but allows any authenticated user
    async getMyRoles(@Req() req) {
        // req.user populated by JwtAuthGuard

        const employeeId = req.user.id;
        console.log('JWT payload:', req.user);

        console.log('req.user._id:', req.user.id);

        const roles = await this.svc.getMyRoles(employeeId);
        return { roles }; // returns JSON like { roles: ['HR_MANAGER', 'SYSTEM_ADMIN'] }
    }

    // @Get(':id')
    // @Roles()
    // getEmpById(@Param('id') employeeId: string, @Req() req) {
    //     return this.svc.getEmployeeById(employeeId, req.user);
    // }

    @Post('candidate')
    @Roles(SystemRole.RECRUITER)
    createCandidate(@Body() dto: CreateCandidateDto) {
        return this.svc.createCandidate(dto);
    }

    /**
     * REC-004: Update candidate status for pipeline tracking
     * Access: HR Manager, HR Employee, Recruiter
    */
    @Patch('candidates/:id/status')
    @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
    updateCandidateStatus(
        @Param('id') candidateId: string,
        @Body() updateCandidateStatusDto: UpdateCandidateStatusDto,
        @Req() req
    ) {
        return this.svc.updateCandidateStatus(
            candidateId,
            updateCandidateStatusDto.status,
            updateCandidateStatusDto.notes,
            req.user?.id,
            updateCandidateStatusDto.applicationId
        );
    }

    @Get('candidates')
    @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
    getAllCandidates(@Req() req) {
        return this.svc.getAllCandidates(req.user);
    }

    @Get('roles')
    async getByRole(@Query('role') role: SystemRole) {
        return this.svc.findByRole(role);
    }

    // Get all employees for selection (e.g., referral dropdown)
    @Get('all-for-selection')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_ADMIN,
        SystemRole.HR_EMPLOYEE,
        SystemRole.RECRUITER,
        SystemRole.SYSTEM_ADMIN
    )
    getAllForSelection(@Req() req) {
        return this.svc.getAllEmployeesForSelection(req.user);
    }

    // Get all supervisors (department heads, HR managers) for supervisor selection
    @Get('supervisors')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_ADMIN,
        SystemRole.HR_EMPLOYEE,
        SystemRole.SYSTEM_ADMIN
    )
    getSupervisors(@Req() req) {
        return this.svc.getSupervisors(req.user);
    }

    @Get('unique-permissions')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN,
        SystemRole.DEPARTMENT_HEAD

    )
    getUniquePermissions() {
        return this.svc.getUniquePermissions();
    }

    //---------------------------------
    // '/employee-profile/my-employees'
    //---------------------------------
    @Get('my-employees')
    @Roles(SystemRole.DEPARTMENT_HEAD)
    getEmployeesInMyDepartment(@Req() req) {
        console.log("alooooooooooooooo", req.user._id)
        return this.svc.getEmployeesInDepartment(req.user.primaryDepartmentId, req.user);
    }

    //-------------------------------------
    // '/employee-profile/change-requests'
    //-------------------------------------

    //HR views all change requests
    @Get('change-requests/all')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_ADMIN,
        SystemRole.HR_EMPLOYEE,
    )
    getAllCRs(@Req() req) {
        return this.svc.listChangeRequests(req.user);
    }


    @Get('change-request/:requestId')
    @Roles()
    async getChangeRequestById(
        @Param('requestId') requestId: string,
        @Req() req
    ) {
        return this.svc.getChangeRequestById(requestId, req.user);
    }

    //HR reviews a change request
    @Post('change-request/:requestId/review')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_ADMIN,
        SystemRole.HR_EMPLOYEE
    )
    reviewCR(
        @Param('requestId') requestId: string,
        @Body() body: ReviewChangeRequestDto,
        @Req() req
    ) {
        const { action, patch } = body;
        return this.svc.reviewChangeRequest(requestId, action, req.user, patch);
    }
    //------------------------------------
    // '/employee-profile/:employeeNumber'
    //------------------------------------

    @Get(':employeeNumber/my-profile')
    @Roles() // Requires authentication but allows any authenticated user
    getMyProfile(@Param('employeeNumber') employeeNumber: string, @Req() req) {
        return this.svc.getMyProfile(req.user.employeeNumber, req.user);
    }

    //immediate update // kolo mmkn y edit
    @Put(':employeeNumber/my-profile/immediate')
    @Roles() // Requires authentication but allows any authenticated user
    updateSelfImmediate(
        @Param('employeeNumber') employeeNumber: string,
        @Body() dto: UpdateEmployeeSelfImmediateDto,
        @Req() req
    ) {
        return this.svc.updateEmployeeSelfImmediate(employeeNumber, dto, req.user);
    }

    // Critical changes → change request
    @Post(':employeeNumber/my-profile/change-request')
    @Roles(
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.HR_EMPLOYEE
    )
    createChangeRequest(
        @Param('employeeNumber') employeeNumber: string,
        @Body() dto: CreateEmployeeChangeRequestDto,
        @Req() req
    ) {
        return this.svc.createChangeRequest(employeeNumber, dto, req.user);
    }

    // Legal name and marital status change request
    @Post(':employeeNumber/my-profile/legal-change-request')
    @Roles(
        SystemRole.DEPARTMENT_EMPLOYEE,
        SystemRole.HR_EMPLOYEE
    )
    createLegalChangeRequest(
        @Param('employeeNumber') employeeNumber: string,
        @Body() dto: CreateLegalChangeRequestDto,
        @Req() req
    ) {
        return this.svc.createLegalChangeRequest(employeeNumber, dto, req.user);
    }

    @Get(':employeeNumber/my-profile/change-requests')
    @Roles()
    getMyChangeRequests(@Param('employeeNumber') employeeNumber: string, @Req() req) {
        return this.svc.getMyChangeRequests(employeeNumber, req.user);
    }


    //------------------------
    // '/employee-profile/:id'
    //------------------------

    //get specific employee by id
    @Get(':id')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_EMPLOYEE,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN,
        SystemRole.DEPARTMENT_HEAD,
    )
    getOne(@Param('id') id: string, @Req() req) {
        return this.svc.getEmployee(id, req.user);
    }

    //Admin/HR update lel employee
    @Put(':id/admin')
    @Roles(
        SystemRole.HR_MANAGER,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN
    )
    updateAdmin(@Param('id') id: string, @Body() dto: UpdateEmployeeAdminDto, @Req() req) {
        return this.svc.updateEmployeeAdmin(id, dto, req.user);
    }

    @Patch(':id/deactivate')
    @Roles(SystemRole.HR_ADMIN)
    deactivateEmployee(
        @Param('id') id: string,
        @Body('status') status: any,
        @Req() req
    ) {
        return this.svc.deactivateEmployee(id, status, req.user);
    }
}
