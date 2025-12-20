import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TerminationRequest, TerminationRequestDocument } from './Models/termination-request.schema';
import { ClearanceChecklist, ClearanceChecklistDocument } from './Models/clearance-checklist.schema';

import { TerminationStatus } from './enums/termination-status.enum.js';
import { OffboardingService } from './offboarding.service.js';

@Injectable()
export class OffboardingServiceEnhanced {
  private readonly logger = new Logger(OffboardingServiceEnhanced.name);

  constructor(
    @InjectModel(TerminationRequest.name) private terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name) private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
    private offboardingService: OffboardingService,
  ) { }

  // ===== VALIDATION HELPERS =====

  private validateOffboardingRequest(data: any): void {
    if (!data.employeeId) {
      throw new BadRequestException('employeeId is required');
    }
    if (!data.reason) {
      throw new BadRequestException('reason is required');
    }
    if (!data.expectedExitDate && !data.terminationDate) {
      throw new BadRequestException('expectedExitDate or terminationDate is required');
    }
    if (data.expectedExitDate && new Date(data.expectedExitDate) <= new Date()) {
      this.logger.warn('expectedExitDate is in the past, but proceeding with creation');
    }
  }

  private async validateEmployeeNotAlreadyOffboarding(employeeId: string): Promise<void> {
    const existing = await this.terminationRequestModel.findOne({
      employeeId,
      status: { $in: [TerminationStatus.PENDING, TerminationStatus.PENDING] },
    });
    if (existing) {
      throw new BadRequestException(`Employee ${employeeId} already has an active offboarding request`);
    }
  }

  private async validateStageTransition(offboardingRequestId: string, targetStage: string): Promise<void> {
    const offboarding = await this.terminationRequestModel.findById(offboardingRequestId);
    if (!offboarding) {
      throw new NotFoundException(`Offboarding request ${offboardingRequestId} not found`);
    }

    // Get current status from embedded data
    const status = await this.offboardingService.getOffboardingStatus(offboardingRequestId);

    // Validate stage progression
    if (targetStage === 'exit_interview') {
      // Can transition after initiation
    } else if (targetStage === 'asset_return') {
      const exitInterview = await this.offboardingService.getExitInterview(offboardingRequestId);
      if (!exitInterview?.isCompleted) {
        this.logger.warn('Exit interview not completed, but allowing asset return stage transition');
      }
    } else if (targetStage === 'final_settlement') {
      const assets = await this.offboardingService.getAssetsByOffboarding(offboardingRequestId);
      const allReturned = Array.isArray(assets) && assets.every((a: any) => a.returned);
      if (!allReturned) {
        this.logger.warn('Not all assets returned, but allowing settlement stage transition');
      }
    } else if (targetStage === 'clearance') {
      const settlement = await this.offboardingService.getFinalSettlement(offboardingRequestId);
      if (settlement?.settlementStatus !== 'completed') {
        this.logger.warn('Settlement not completed, but allowing clearance stage transition');
      }
    }
  }

  // ===== Offboarding Request CRUD with Enhanced Validation =====

  async createOffboardingRequest(data: any): Promise<TerminationRequestDocument> {
    try {
      this.validateOffboardingRequest(data);
      await this.validateEmployeeNotAlreadyOffboarding(data.employeeId);

      const result = await this.offboardingService.createOffboardingRequest(data);
      this.logger.log(`Offboarding request created for employee ${data.employeeId}`);

      // Automatically create status tracking
      await this.offboardingService.createOffboardingStatus(result._id.toString(), data.employeeId);

      return result;
    } catch (error) {
      this.logger.error(`Error creating offboarding request: ${error.message}`);
      throw error;
    }
  }

  async getOffboardingRequest(id: string): Promise<TerminationRequestDocument> {
    try {
      const request = await this.offboardingService.getOffboardingRequest(id);
      if (!request) {
        throw new NotFoundException(`Offboarding request ${id} not found`);
      }
      return request;
    } catch (error) {
      this.logger.error(`Error retrieving offboarding request ${id}: ${error.message}`);
      throw error;
    }
  }

  async getAllOffboardingRequests(filters?: any): Promise<TerminationRequestDocument[]> {
    try {
      return await this.offboardingService.getAllOffboardingRequests(filters);
    } catch (error) {
      this.logger.error(`Error retrieving offboarding requests: ${error.message}`);
      throw error;
    }
  }

  async getOffboardingRequestsByEmployee(employeeId: string): Promise<TerminationRequestDocument[]> {
    try {
      return await this.offboardingService.getOffboardingRequestsByEmployee(employeeId);
    } catch (error) {
      this.logger.error(`Error retrieving offboarding requests for employee ${employeeId}: ${error.message}`);
      throw error;
    }
  }

  async updateOffboardingRequest(id: string, data: any): Promise<TerminationRequestDocument> {
    try {
      const request = await this.offboardingService.updateOffboardingRequest(id, data);
      if (!request) {
        throw new NotFoundException(`Offboarding request ${id} not found`);
      }
      this.logger.log(`Offboarding request ${id} updated`);
      return request;
    } catch (error) {
      this.logger.error(`Error updating offboarding request ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteOffboardingRequest(id: string): Promise<any> {
    try {
      const result = await this.offboardingService.deleteOffboardingRequest(id);
      if (!result) {
        throw new NotFoundException(`Offboarding request ${id} not found`);
      }
      this.logger.log(`Offboarding request ${id} deleted`);
      return { message: 'Offboarding request deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting offboarding request ${id}: ${error.message}`);
      throw error;
    }
  }

  // ===== Offboarding Status Tracking with Validation =====

  async createOffboardingStatus(offboardingRequestId: string, employeeId: string): Promise<any> {
    try {
      const result = await this.offboardingService.createOffboardingStatus(offboardingRequestId, employeeId);
      this.logger.log(`Offboarding status created for request ${offboardingRequestId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating offboarding status: ${error.message}`);
      throw error;
    }
  }

  async getOffboardingStatus(id: string): Promise<any> {
    try {
      const status = await this.offboardingService.getOffboardingStatus(id);
      if (!status) {
        throw new NotFoundException(`Offboarding status ${id} not found`);
      }
      return status;
    } catch (error) {
      this.logger.error(`Error retrieving offboarding status ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateOffboardingStage(offboardingRequestId: string, newStage: string): Promise<any> {
    try {
      await this.validateStageTransition(offboardingRequestId, newStage);
      const updated = await this.offboardingService.updateOffboardingStage(offboardingRequestId, newStage);
      this.logger.log(`Offboarding request ${offboardingRequestId} transitioned to stage ${newStage}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating offboarding stage for request ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }

  async completeOffboardingStage(offboardingRequestId: string): Promise<any> {
    try {
      const result = await this.offboardingService.completeOffboardingStage(offboardingRequestId);
      this.logger.log(`Offboarding stage completed for request ${offboardingRequestId}`);

      // Check if all stages completed
      const status = await this.offboardingService.getOffboardingStatus(offboardingRequestId);
      if (status && status.completionPercentage === 100) {
        await this.markOffboardingAsCompleted(offboardingRequestId);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error completing offboarding stage for request ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }

  // ===== Exit Interview with Enhanced Error Handling =====

  async createExitInterview(offboardingRequestId: string, employeeId: string, data: any): Promise<any> {
    try {
      const offboarding = await this.terminationRequestModel.findById(offboardingRequestId);
      if (!offboarding) {
        throw new NotFoundException(`Offboarding request ${offboardingRequestId} not found`);
      }

      const result = await this.offboardingService.createExitInterview(offboardingRequestId, employeeId, data);
      this.logger.log(`Exit interview created for offboarding request ${offboardingRequestId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating exit interview: ${error.message}`);
      throw error;
    }
  }

  async getExitInterview(id: string): Promise<any> {
    try {
      const interview = await this.offboardingService.getExitInterview(id);
      if (!interview) {
        throw new NotFoundException(`Exit interview ${id} not found`);
      }
      return interview;
    } catch (error) {
      this.logger.error(`Error retrieving exit interview ${id}: ${error.message}`);
      throw error;
    }
  }

  async getExitInterviewByOffboarding(offboardingRequestId: string): Promise<any> {
    try {
      const interview = await this.offboardingService.getExitInterviewByOffboarding(offboardingRequestId);
      if (!interview) {
        throw new NotFoundException(`Exit interview not found for offboarding request ${offboardingRequestId}`);
      }
      return interview;
    } catch (error) {
      this.logger.error(`Error retrieving exit interview for offboarding request ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }

  async updateExitInterview(id: string, data: any): Promise<any> {
    try {
      const interview = await this.offboardingService.updateExitInterview(id, data);
      this.logger.log(`Exit interview ${id} updated`);
      return interview;
    } catch (error) {
      this.logger.error(`Error updating exit interview ${id}: ${error.message}`);
      throw error;
    }
  }

  async completeExitInterview(id: string): Promise<any> {
    try {
      const interview = await this.offboardingService.completeExitInterview(id);
      this.logger.log(`Exit interview ${id} marked as completed`);
      return interview;
    } catch (error) {
      this.logger.error(`Error completing exit interview ${id}: ${error.message}`);
      throw error;
    }
  }

  // ===== Asset Return with Validation =====

  async createAssetReturn(offboardingRequestId: string, employeeId: string, assetData: any): Promise<any> {
    try {
      const offboarding = await this.terminationRequestModel.findById(offboardingRequestId);
      if (!offboarding) {
        throw new NotFoundException(`Offboarding request ${offboardingRequestId} not found`);
      }

      const result = await this.offboardingService.createAssetReturn(offboardingRequestId, employeeId, assetData);
      this.logger.log(`Asset registered for return in offboarding request ${offboardingRequestId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating asset return: ${error.message}`);
      throw error;
    }
  }

  async getAssetReturn(id: string): Promise<any> {
    try {
      const asset = await this.offboardingService.getAssetReturn(id);
      if (!asset) {
        throw new NotFoundException(`Asset return ${id} not found`);
      }
      return asset;
    } catch (error) {
      this.logger.error(`Error retrieving asset return ${id}: ${error.message}`);
      throw error;
    }
  }

  async getAssetsByOffboarding(offboardingRequestId: string): Promise<any[]> {
    try {
      return await this.offboardingService.getAssetsByOffboarding(offboardingRequestId);
    } catch (error) {
      this.logger.error(`Error retrieving assets for offboarding request ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }

  async updateAssetReturn(id: string, data: any): Promise<any> {
    try {
      const asset = await this.offboardingService.updateAssetReturn(id, data);
      this.logger.log(`Asset return ${id} updated`);
      return asset;
    } catch (error) {
      this.logger.error(`Error updating asset return ${id}: ${error.message}`);
      throw error;
    }
  }

  async markAssetAsReturned(id: string, receivedByPersonId: string, condition: string): Promise<any> {
    try {
      const asset = await this.offboardingService.markAssetAsReturned(id, receivedByPersonId, condition);
      this.logger.log(`Asset ${id} marked as returned`);
      return asset;
    } catch (error) {
      this.logger.error(`Error marking asset as returned ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteAssetReturn(id: string): Promise<any> {
    try {
      const result = await this.offboardingService.deleteAssetReturn(id);
      this.logger.log(`Asset return ${id} deleted`);
      return { message: 'Asset return record deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting asset return ${id}: ${error.message}`);
      throw error;
    }
  }

  // ===== Final Settlement with Validation =====

  async createFinalSettlement(offboardingRequestId: string, employeeId: string, data: any): Promise<any> {
    try {
      const offboarding = await this.terminationRequestModel.findById(offboardingRequestId);
      if (!offboarding) {
        throw new NotFoundException(`Offboarding request ${offboardingRequestId} not found`);
      }

      const result = await this.offboardingService.createFinalSettlement(offboardingRequestId, employeeId, data);
      this.logger.log(`Final settlement created for offboarding request ${offboardingRequestId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating final settlement: ${error.message}`);
      throw error;
    }
  }

  async getFinalSettlement(id: string): Promise<any> {
    try {
      const settlement = await this.offboardingService.getFinalSettlement(id);
      if (!settlement) {
        throw new NotFoundException(`Final settlement ${id} not found`);
      }
      return settlement;
    } catch (error) {
      this.logger.error(`Error retrieving final settlement ${id}: ${error.message}`);
      throw error;
    }
  }

  async getFinalSettlementByOffboarding(offboardingRequestId: string): Promise<any> {
    try {
      const settlement = await this.offboardingService.getFinalSettlementByOffboarding(offboardingRequestId);
      if (!settlement) {
        throw new NotFoundException(`Final settlement not found for offboarding request ${offboardingRequestId}`);
      }
      return settlement;
    } catch (error) {
      this.logger.error(`Error retrieving final settlement for offboarding request ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }

  async updateFinalSettlement(id: string, data: any): Promise<any> {
    try {
      const settlement = await this.offboardingService.updateFinalSettlement(id, data);
      this.logger.log(`Final settlement ${id} updated`);
      return settlement;
    } catch (error) {
      this.logger.error(`Error updating final settlement ${id}: ${error.message}`);
      throw error;
    }
  }

  async processFinalSettlement(id: string, paymentData: any, processedByPersonId: string): Promise<any> {
    try {
      if (!paymentData.netSettlementAmount && !paymentData.amount) {
        throw new BadRequestException('netSettlementAmount or amount is required for settlement processing');
      }

      const settlement = await this.offboardingService.processFinalSettlement(id, paymentData, processedByPersonId);
      this.logger.log(`Final settlement ${id} processed`);
      return settlement;
    } catch (error) {
      this.logger.error(`Error processing final settlement ${id}: ${error.message}`);
      throw error;
    }
  }

  async acknowledgeSettlement(id: string): Promise<any> {
    try {
      const settlement = await this.offboardingService.acknowledgeSettlement(id);
      this.logger.log(`Final settlement ${id} acknowledged by employee`);
      return settlement;
    } catch (error) {
      this.logger.error(`Error acknowledging final settlement ${id}: ${error.message}`);
      throw error;
    }
  }

  // ===== Clearance Checklist =====

  async getClearanceChecklist(id: string): Promise<ClearanceChecklistDocument> {
    try {
      const checklist = await this.offboardingService.getClearanceChecklist(id);
      if (!checklist) {
        throw new NotFoundException(`Clearance checklist ${id} not found`);
      }
      return checklist;
    } catch (error) {
      this.logger.error(`Error retrieving clearance checklist ${id}: ${error.message}`);
      throw error;
    }
  }

  async getClearanceChecklistByOffboarding(offboardingRequestId: string): Promise<ClearanceChecklistDocument> {
    try {
      const checklist = await this.offboardingService.getClearanceChecklistByOffboarding(offboardingRequestId);
      if (!checklist) {
        throw new NotFoundException(`Clearance checklist not found for offboarding request ${offboardingRequestId}`);
      }
      return checklist;
    } catch (error) {
      this.logger.error(`Error retrieving clearance checklist for offboarding request ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }
  // ===== Dashboard & Metrics =====

  async getOffboardingPipeline(employeeId?: string): Promise<TerminationRequestDocument[]> {
    try {
      return await this.offboardingService.getOffboardingPipeline(employeeId);
    } catch (error) {
      this.logger.error(`Error retrieving offboarding pipeline: ${error.message}`);
      throw error;
    }
  }

  async getOffboardingMetrics(): Promise<any> {
    try {
      const metrics = await this.offboardingService.getOffboardingMetrics();
      this.logger.log(`Offboarding metrics retrieved`);
      return metrics;
    } catch (error) {
      this.logger.error(`Error retrieving offboarding metrics: ${error.message}`);
      throw error;
    }
  }

  async getOffboardingProgress(offboardingRequestId: string): Promise<any> {
    try {
      const progress = await this.offboardingService.getOffboardingProgress(offboardingRequestId);
      this.logger.log(`Progress retrieved for offboarding request ${offboardingRequestId}`);
      return progress;
    } catch (error) {
      this.logger.error(`Error retrieving offboarding progress for ${offboardingRequestId}: ${error.message}`);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  async markOffboardingAsCompleted(offboardingRequestId: string): Promise<TerminationRequestDocument> {
    try {
      const updated = await this.terminationRequestModel.findByIdAndUpdate(
        offboardingRequestId,
        {
          status: TerminationStatus.APPROVED,
        },
        { new: true },
      );

      if (!updated) {
        throw new NotFoundException(`Offboarding request ${offboardingRequestId} not found`);
      }

      this.logger.log(`Offboarding request ${offboardingRequestId} marked as completed`);
      return updated;
    } catch (error) {
      this.logger.error(`Error marking offboarding as completed: ${error.message}`);
      throw error;
    }
  }

  async cancelOffboarding(offboardingRequestId: string, reason: string): Promise<TerminationRequestDocument> {
    try {
      if (!reason) {
        throw new BadRequestException('Reason for cancellation is required');
      }

      const termination = await this.terminationRequestModel.findById(offboardingRequestId);
      if (!termination) {
        throw new NotFoundException(`Offboarding request ${offboardingRequestId} not found`);
      }

      termination.hrComments = `${termination.hrComments || ''}\nCancelled: ${reason}`;
      termination.status = TerminationStatus.REJECTED;
      await termination.save();

      this.logger.log(`Offboarding request ${offboardingRequestId} cancelled: ${reason}`);
      return termination;
    } catch (error) {
      this.logger.error(`Error cancelling offboarding: ${error.message}`);
      throw error;
    }
  }
}
