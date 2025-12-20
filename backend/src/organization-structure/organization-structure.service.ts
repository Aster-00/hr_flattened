import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department, DepartmentDocument } from './Models/department.schema';
import mongoose, { Model } from 'mongoose';
import { createDepartmentDto } from './dto/createDepartment.dto';
import { updateDepartmentDto } from './dto/updateDepartment.dto';
import { createPositionDto } from './dto/createPosition.dto';
import { updatePositionDto } from './dto/Updateposition.dto';
import { PositionAssignment } from './Models/position-assignment.schema';
import { Position, PositionDocument } from './Models/position.schema';
import {
  NotificationLog,
  NotificationLogDocument,
} from 'src/time-management/Models/notification-log.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from 'src/employee-profile/Models/employee-profile.schema';
import { UserProfileBase } from 'src/employee-profile/Models/user-schema';
import { StructureRequestType } from './enums/organization-structure.enums';
import { StructureRequestStatus } from './enums/organization-structure.enums';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from './Models/structure-change-request.schema';
import {
  StructureApproval,
  StructureApprovalDocument,
} from './Models/structure-approval.schema';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: mongoose.Model<DepartmentDocument>,

    @InjectModel(Position.name)
    private positionModel: mongoose.Model<PositionDocument>,

    @InjectModel(EmployeeProfile.name)
    private EmployeeProfileModel: mongoose.Model<EmployeeProfileDocument>,

    @InjectModel(NotificationLog.name)
    private NotificationLogModel: mongoose.Model<NotificationLogDocument>,

    @InjectModel(StructureChangeRequest.name)
    private structurechangeRequestModel: mongoose.Model<StructureChangeRequestDocument>,

    @InjectModel(StructureChangeRequest.name)
    private structureApprovalModel: mongoose.Model<StructureApprovalDocument>,
  ) { }

  async createDepartment(
    department: createDepartmentDto,
  ): Promise<DepartmentDocument> {
    const newDepartment = new this.departmentModel(department);
    const dept = await newDepartment.save();
    // const log = new this.NotificationLogModel({
    //   to: 'relevant manager/admin/stakeholder',
    //   message: 'A new department was created',
    // });
    // await log.save();

    return dept;
  }

  async createPosition(position: createPositionDto): Promise<PositionDocument> {
    const newPosition = new this.positionModel(position);
    const pos = await newPosition.save();
    // const log = new this.NotificationLogModel({
    //   to: 'relevant manager/admin/stakeholder',
    //   message: 'A new Position was created',
    // });
    // await log.save();

    return pos;
  }

  async updateDepartment(
    id: string,
    updateData: updateDepartmentDto,
  ): Promise<DepartmentDocument> {
    const dept = await this.departmentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!dept) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    // const log = new this.NotificationLogModel({
    //   to: 'relevant manager/admin/stakeholder',
    //   message: 'A department was Updated',
    // });
    // await log.save();

    return dept;
  }

  async updatePosition(
    id: string,
    updatePosition: updatePositionDto,
  ): Promise<PositionDocument> {
    const newPosition = await this.positionModel.findByIdAndUpdate(
      id,
      updatePosition,
    );
    if (!newPosition) {
      throw new NotFoundException(`Poistion with Id ${id} is not found`);
    }
    // const log = new this.NotificationLogModel({
    //   to: 'relevant manager/admin/stakeholder',
    //   message: "An employee's position has been changed",
    // });
    // await log.save();

    return newPosition;
  }

async deletePosition(id: string, to: string): Promise<PositionDocument> {
  const deletedPos = await this.positionModel.findByIdAndDelete(id);

  if (!deletedPos) {
    throw new NotFoundException(`Position with Id ${id} not found`);
  }

  // const log = new this.NotificationLogModel({
  //   to: to || 'system',
  //   type: 'ORG_STRUCTURE',
  //   message: 'A position was removed',
  // });
  // await log.save();

  return deletedPos;
}


  async deleteDepartment(id: string): Promise<DepartmentDocument> {
    const deletedDept = await this.departmentModel.findByIdAndDelete(id);

    if (!deletedDept) {
      throw new NotFoundException(`Poistion with Id ${id} is not found`);
    }
    // const log = new this.NotificationLogModel({
    //   to: 'relevant manager/admin/stakeholder',
    //   message: 'A department was removed',
    // });
    // await log.save();

    return deletedDept;
  }

  async getAllDepartments() {
    return this.departmentModel
      .find({ isActive: true })
      .select('_id code name')
      .lean()
      .exec();
  }

  async getAllPositions() {
    return this.positionModel
      .find({ isActive: true })
      .select('_id code title departmentId')
      .lean()
      .exec();
  }

  // all functions till here are only for admin
  async viewHierarchy(id: string) {
    // Get the employee
    const employee = await this.EmployeeProfileModel.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    // Get employee's position
    const employeePosition = await this.positionModel.findById(
      employee.primaryPositionId,
    );

    // Get employee's department
    const employeeDepartment = await this.departmentModel.findById(
      employee.primaryDepartmentId,
    );

    // Get employee's manager info
    let manager: EmployeeProfileDocument | null = null;
    if (employee.supervisorPositionId) {
      manager = await this.EmployeeProfileModel.findOne({
        primaryPositionId: employee.supervisorPositionId,
      });
    }
    // Get manager's manager info
    let managerManager: EmployeeProfileDocument | null = null;
    if (manager && manager.supervisorPositionId) {
      managerManager = await this.EmployeeProfileModel.findOne({
        primaryPositionId: manager.supervisorPositionId,
      });
    }

    // Build employee hierarchy data
    const employeeHierarchy = {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      department: employeeDepartment?.name || null,
      position: employeePosition?.title || null,
      manager: manager
        ? {
          id: manager.id,
          name: `${manager.firstName} ${manager.lastName}`,
          position:
            (await this.positionModel.findById(manager.primaryPositionId))
              ?.title || null,
        }
        : null,
      managerManager: managerManager
        ? {
          id: managerManager.id,
          name: `${managerManager.firstName} ${managerManager.lastName}`,
          position:
            (
              await this.positionModel.findById(
                managerManager.primaryPositionId,
              )
            )?.title || null,
        }
        : null,
    };

    // If employee is a manager, get their team structure
    let teamStructure;
    if (
      employeePosition?.title === 'Manager' ||
      employeePosition?.title?.includes('Manager')
    ) {
      // Find all employees who report to this employee's position
      const teamMembers = await this.EmployeeProfileModel.find({
        supervisorPositionId: employee.primaryPositionId,
      });

      teamStructure = await Promise.all(
        teamMembers.map(async (member) => {
          const memberPosition = await this.positionModel.findById(
            member.primaryPositionId,
          );
          const memberDepartment = await this.departmentModel.findById(
            member.primaryDepartmentId,
          );

          return {
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            position: memberPosition?.title || null,
            department: memberDepartment?.name || null,
          };
        }),
      );
    }

    return {
      employeeHierarchy,
      teamStructure: teamStructure || [],
    };
  }
  //managr requests
  async createDepartmentChangeReq(
    managerId: string,
    employeeid: string,
    oldDept: string,
    newDept: string,
  ): Promise<StructureChangeRequest> {
    const requestNumber = `REQ-${Date.now()}`;

    const changeRequest = await this.structurechangeRequestModel.create({
      _id: new mongoose.Types.ObjectId(),
      requestNumber,
      requestedByEmployeeId: employeeid,
      requestType: StructureRequestType.UPDATE_DEPARTMENT,
      targetDepartmentId: newDept,
      details: `Change department from ${oldDept} to ${newDept}`,
      reason: 'Internal Process',
      status: StructureRequestStatus.SUBMITTED,
      submittedByEmployeeId: managerId,
      submittedAt: new Date(),
    });

    return changeRequest;
  }
  async createPositionChangeReq(
    managerId: string,
    employeeId: string,
    oldPos: string,
    newPos: string,
  ): Promise<StructureChangeRequest> {
    const requestNumber = `REQ-${Date.now()}`;

    const manager = await this.EmployeeProfileModel.findById(managerId);
    if (!manager) {
      throw new NotFoundException('The id provided is not valid');
    }

    const employee = await this.EmployeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    }

    const changeRequest = await this.structurechangeRequestModel.create({
      _id: new mongoose.Types.ObjectId(),
      requestNumber,
      requestedByEmployeeId: employeeId,
      requestType: StructureRequestType.UPDATE_POSITION,
      targetPositionId: newPos,
      details: `Change ${employee.firstName}'s Position from ${oldPos} to ${newPos}`,
      reason: 'Internal Process',
      status: StructureRequestStatus.SUBMITTED,
      submittedByEmployeeId: managerId,
      submittedAt: new Date(),
    });

    return changeRequest;
  }
  //sys admin review
  async reviewChangeRequest(
    requestId: string,
    approve: boolean,
  ): Promise<StructureApprovalDocument> {
    const request = await this.structurechangeRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    if (approve) {
      switch (request.requestType) {
        case StructureRequestType.UPDATE_POSITION: {
          const employee = await this.EmployeeProfileModel.findById(
            request.requestedByEmployeeId,
          );
          if (!employee) {
            throw new NotFoundException(`Employee with id ${request.requestedByEmployeeId} not found`);
          }
          if (!employee.primaryPositionId) {
            throw new NotFoundException(`Employee with id ${request.requestedByEmployeeId} has no primary position`);
          }

          const newPos = await this.positionModel.findById(request.targetPositionId);
          if (!newPos) {
            throw new NotFoundException(`Position with id ${request.targetPositionId} not found`);
          }

          const upNewPos: updatePositionDto = {
            code: newPos.code,
            title: newPos.title,
            departmentId: newPos.departmentId.toString(),
            reportsToPositionId: newPos.reportsToPositionId
              ? newPos.reportsToPositionId.toString()
              : undefined,
            isActive: true,
          };

          await this.updatePosition(employee.primaryPositionId.toString(), upNewPos);
          break;
        }
        case StructureRequestType.UPDATE_DEPARTMENT: {
          const employee = await this.EmployeeProfileModel.findById(
            request.requestedByEmployeeId,
          );
          if (!employee) {
            throw new NotFoundException(`Employee with id ${request.requestedByEmployeeId} not found`);
          }
          if (!employee.primaryDepartmentId) {
            throw new NotFoundException(`Employee with id ${request.requestedByEmployeeId} has no primary department`);
          }

          const newDept = await this.departmentModel.findById(request.targetDepartmentId);
          if (!newDept) {
            throw new NotFoundException(`Department with id ${request.targetDepartmentId} not found`);
          }

          const upNewDept: updateDepartmentDto = {
            code: newDept.code,
            name: newDept.name,
            description: newDept.description,
            isActive: true,
          };

          await this.updateDepartment(employee.primaryDepartmentId.toString(), upNewDept);
          break;
        }

        default:
          break;
      }
    }

    const decision = approve ? 'APPROVED' : 'REJECTED';
    const approval = await this.structureApprovalModel.create({
      changeRequestId: requestId,
      approverEmployeeId: request.requestedByEmployeeId,
      decision,
      decidedAt: new Date(),
      comments: approve ? 'Request approved' : 'Request rejected',
    });

    return approval;
  }
}
