import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TerminationRequest, TerminationRequestDocument } from './Models/termination-request.schema';
import { ClearanceChecklist, ClearanceChecklistDocument } from './Models/clearance-checklist.schema';

import { TerminationStatus } from './enums/termination-status.enum.js';

@Injectable()
export class OffboardingService {
  constructor(
    @InjectModel(TerminationRequest.name) private terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name) private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
  ) { }

  // ===== Offboarding Request CRUD (Using TerminationRequest) =====

  async createOffboardingRequest(data: any) {
    // Create termination request which serves as offboarding request
    const newRequest = new this.terminationRequestModel({
      employeeId: data.employeeId,
      initiator: data.initiator || 'EMPLOYEE',
      reason: data.reason,
      employeeComments: data.employeeComments,
      hrComments: data.hrComments,
      status: data.status || TerminationStatus.PENDING,
      terminationDate: data.expectedExitDate || data.terminationDate,
      contractId: data.contractId,
    });
    return await newRequest.save();
  }

  async getOffboardingRequest(id: string) {
    return await this.terminationRequestModel.findById(id).populate('employeeId').populate('contractId');
  }

  async getAllOffboardingRequests(filters?: any) {
    const query = this.terminationRequestModel.find(filters || {});
    return await query.populate('employeeId').populate('contractId').exec();
  }

  async getOffboardingRequestsByEmployee(employeeId: string) {
    return await this.terminationRequestModel
      .find({ employeeId })
      .populate('employeeId')
      .populate('contractId')
      .sort({ createdAt: -1 });
  }

  async updateOffboardingRequest(id: string, data: any) {
    const updateData: any = {};
    if (data.reason) updateData.reason = data.reason;
    if (data.employeeComments) updateData.employeeComments = data.employeeComments;
    if (data.hrComments) updateData.hrComments = data.hrComments;
    if (data.status) updateData.status = data.status;
    if (data.expectedExitDate || data.terminationDate) {
      updateData.terminationDate = data.expectedExitDate || data.terminationDate;
    }

    return await this.terminationRequestModel.findByIdAndUpdate(id, updateData, { new: true }).populate('employeeId');
  }

  async deleteOffboardingRequest(id: string) {
    return await this.terminationRequestModel.findByIdAndDelete(id);
  }

  // ===== Offboarding Status Tracking (Embedded in TerminationRequest) =====

  async createOffboardingStatus(offboardingRequestId: string, employeeId: string) {
    // Update termination request with status tracking info in hrComments
    const termination = await this.terminationRequestModel.findById(offboardingRequestId);
    if (termination) {
      const statusInfo = {
        currentStage: 'initiated',
        stageStartDate: new Date(),
        completedStages: [],
        completionPercentage: 0,
      };
      termination.hrComments = `${termination.hrComments || ''}\n[STATUS]: ${JSON.stringify(statusInfo)}`;
      await termination.save();
    }
    return termination;
  }

  async getOffboardingStatus(id: string) {
    const termination = await this.terminationRequestModel.findById(id).populate('employeeId');
    // Parse status from hrComments
    if (termination?.hrComments) {
      const statusMatch = termination.hrComments.match(/\[STATUS\]: ({.*})/);
      if (statusMatch) {
        try {
          return JSON.parse(statusMatch[1]);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  async updateOffboardingStage(offboardingRequestId: string, newStage: string) {
    const termination = await this.terminationRequestModel.findById(offboardingRequestId);
    if (termination) {
      const existingStatus = await this.getOffboardingStatus(offboardingRequestId) || {
        currentStage: 'initiated',
        completedStages: [],
        completionPercentage: 0,
      };

      existingStatus.currentStage = newStage;
      existingStatus.stageStartDate = new Date();

      // Update hrComments with new status
      const cleanedComments = termination.hrComments?.replace(/\[STATUS\]: {.*}/, '').trim() || '';
      termination.hrComments = `${cleanedComments}\n[STATUS]: ${JSON.stringify(existingStatus)}`;
      await termination.save();
    }
    return termination;
  }

  async completeOffboardingStage(offboardingRequestId: string) {
    const termination = await this.terminationRequestModel.findById(offboardingRequestId);
    if (termination) {
      const status = await this.getOffboardingStatus(offboardingRequestId) || {
        currentStage: 'initiated',
        completedStages: [],
        completionPercentage: 0,
      };

      if (!status.completedStages.includes(status.currentStage)) {
        status.completedStages.push(status.currentStage);
      }
      status.stageCompletionDate = new Date();
      status.completionPercentage = (status.completedStages.length / 6) * 100; // 6 stages: initiated, exit_interview, asset_return, final_settlement, clearance, completed

      const cleanedComments = termination.hrComments?.replace(/\[STATUS\]: {.*}/, '').trim() || '';
      termination.hrComments = `${cleanedComments}\n[STATUS]: ${JSON.stringify(status)}`;
      await termination.save();
    }
    return termination;
  }

  // ===== Exit Interview (Embedded in TerminationRequest.employeeComments) =====

  async createExitInterview(offboardingRequestId: string, employeeId: string, data: any) {
    const termination = await this.terminationRequestModel.findById(offboardingRequestId);
    if (termination) {
      const interviewData = {
        interviewDate: new Date(),
        ...data,
        isCompleted: false,
      };
      const existingComments = termination.employeeComments || '';
      termination.employeeComments = `${existingComments}\n[EXIT_INTERVIEW]: ${JSON.stringify(interviewData)}`;
      await termination.save();
    }
    return termination;
  }

  async getExitInterview(id: string) {
    // id here is the termination request id
    const termination = await this.terminationRequestModel.findById(id).populate('employeeId');
    if (termination?.employeeComments) {
      const interviewMatch = termination.employeeComments.match(/\[EXIT_INTERVIEW\]: ({.*})/);
      if (interviewMatch) {
        try {
          return JSON.parse(interviewMatch[1]);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  async getExitInterviewByOffboarding(offboardingRequestId: string) {
    return await this.getExitInterview(offboardingRequestId);
  }

  async updateExitInterview(id: string, data: any) {
    const termination = await this.terminationRequestModel.findById(id);
    if (termination) {
      const existingInterview = await this.getExitInterview(id) || {};
      const updatedInterview = { ...existingInterview, ...data };

      const cleanedComments = termination.employeeComments?.replace(/\[EXIT_INTERVIEW\]: {.*}/, '').trim() || '';
      termination.employeeComments = `${cleanedComments}\n[EXIT_INTERVIEW]: ${JSON.stringify(updatedInterview)}`;
      await termination.save();
    }
    return termination;
  }

  async completeExitInterview(id: string) {
    return await this.updateExitInterview(id, { isCompleted: true });
  }

  // ===== Asset Return (Using ClearanceChecklist.equipmentList) =====

  async createAssetReturn(offboardingRequestId: string, employeeId: string, assetData: any) {
    // Find or create clearance checklist for this termination
    let checklist = await this.clearanceChecklistModel.findOne({ terminationId: offboardingRequestId });

    if (!checklist) {
      checklist = new this.clearanceChecklistModel({
        terminationId: offboardingRequestId,
        items: [],
        equipmentList: [],
        cardReturned: false,
      });
    }

    // Add asset to equipment list
    checklist.equipmentList.push({
      equipmentId: assetData.assetId,
      name: assetData.assetName || assetData.name,
      returned: false,
      condition: assetData.condition || 'pending',
    });

    await checklist.save();
    return checklist;
  }

  async getAssetReturn(id: string) {
    // id is the clearance checklist id
    return await this.clearanceChecklistModel.findById(id).populate('terminationId');
  }

  async getAssetsByOffboarding(offboardingRequestId: string) {
    const checklist = await this.clearanceChecklistModel.findOne({ terminationId: offboardingRequestId });
    return checklist?.equipmentList || [];
  }

  async updateAssetReturn(id: string, data: any) {
    // id is termination request id, data contains asset info
    const checklist = await this.clearanceChecklistModel.findOne({ terminationId: id });
    if (checklist && data.assetId) {
      const asset = checklist.equipmentList.find((eq: any) => eq.equipmentId?.toString() === data.assetId);
      if (asset) {
        if (data.name) asset.name = data.name;
        if (data.condition) asset.condition = data.condition;
        if (data.returned !== undefined) asset.returned = data.returned;
        await checklist.save();
      }
    }
    return checklist;
  }

  async markAssetAsReturned(id: string, receivedByPersonId: string, condition: string) {
    // id is the termination request id
    const checklist = await this.clearanceChecklistModel.findOne({ terminationId: id });
    if (checklist && checklist.equipmentList.length > 0) {
      // Mark the first unreturned asset or all assets
      checklist.equipmentList.forEach((asset: any) => {
        asset.returned = true;
        asset.condition = condition;
      });
      await checklist.save();
    }
    return checklist;
  }

  async deleteAssetReturn(id: string) {
    // Remove asset from equipment list
    const checklist = await this.clearanceChecklistModel.findOne({ terminationId: id });
    if (checklist && checklist.equipmentList.length > 0) {
      checklist.equipmentList.pop(); // Remove last asset
      await checklist.save();
    }
    return checklist;
  }

  // ===== Final Settlement (Embedded in TerminationRequest.hrComments) =====

  async createFinalSettlement(offboardingRequestId: string, employeeId: string, data: any) {
    const termination = await this.terminationRequestModel.findById(offboardingRequestId);
    if (termination) {
      const settlementData = {
        ...data,
        settlementStatus: data.settlementStatus || 'pending',
        createdDate: new Date(),
      };
      const existingComments = termination.hrComments || '';
      const cleanedComments = existingComments.replace(/\[SETTLEMENT\]: {.*}/, '').trim();
      termination.hrComments = `${cleanedComments}\n[SETTLEMENT]: ${JSON.stringify(settlementData)}`;
      await termination.save();
    }
    return termination;
  }

  async getFinalSettlement(id: string) {
    const termination = await this.terminationRequestModel.findById(id).populate('employeeId');
    if (termination?.hrComments) {
      const settlementMatch = termination.hrComments.match(/\[SETTLEMENT\]: ({.*})/);
      if (settlementMatch) {
        try {
          return JSON.parse(settlementMatch[1]);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  async getFinalSettlementByOffboarding(offboardingRequestId: string) {
    return await this.getFinalSettlement(offboardingRequestId);
  }

  async updateFinalSettlement(id: string, data: any) {
    const termination = await this.terminationRequestModel.findById(id);
    if (termination) {
      const existingSettlement = await this.getFinalSettlement(id) || {};
      const updatedSettlement = { ...existingSettlement, ...data };

      const existingComments = termination.hrComments || '';
      const cleanedComments = existingComments.replace(/\[SETTLEMENT\]: {.*}/, '').trim();
      termination.hrComments = `${cleanedComments}\n[SETTLEMENT]: ${JSON.stringify(updatedSettlement)}`;
      await termination.save();
    }
    return termination;
  }

  async processFinalSettlement(id: string, paymentData: any, processedByPersonId: string) {
    return await this.updateFinalSettlement(id, {
      settlementStatus: 'processed',
      paymentDate: new Date(),
      processedByPersonId,
      ...paymentData,
    });
  }

  async acknowledgeSettlement(id: string) {
    return await this.updateFinalSettlement(id, {
      employeeAcknowledgement: true,
      acknowledgementDate: new Date(),
    });
  }

  // ===== Clearance Checklist CRUD =====

  async getClearanceChecklist(id: string) {
    return await this.clearanceChecklistModel.findById(id).populate('terminationId');
  }

  async getClearanceChecklistByOffboarding(offboardingRequestId: string) {
    return await this.clearanceChecklistModel.findOne({ terminationId: offboardingRequestId });
  }

  async updateClearanceChecklistByOffboarding(offboardingRequestId: string, data: any) {
    let checklist = await this.clearanceChecklistModel.findOne({ terminationId: offboardingRequestId });

    if (!checklist) {
      checklist = new this.clearanceChecklistModel({
        terminationId: offboardingRequestId,
        items: [
          { department: 'IT', status: 'pending', comments: '' },
          { department: 'Finance', status: 'pending', comments: '' },
          { department: 'Facilities', status: 'pending', comments: '' },
          { department: 'HR', status: 'pending', comments: '' },
          { department: 'Admin', status: 'pending', comments: '' },
        ],
        equipmentList: [],
        cardReturned: false,
      });
    }

    if (data?.cardReturned !== undefined) {
      checklist.cardReturned = !!data.cardReturned;
    }

    // Supports updating a single department item: { department, status, comments, updatedBy }
    if (data?.department) {
      const dept = String(data.department);
      const existing = (checklist.items || []).find((i: any) => i.department === dept);
      const updateTarget = existing || { department: dept };

      if (data.status) updateTarget.status = data.status;
      if (data.comments !== undefined) updateTarget.comments = data.comments;
      if (data.updatedBy) updateTarget.updatedBy = data.updatedBy;
      updateTarget.updatedAt = new Date();

      if (!existing) {
        checklist.items = Array.isArray(checklist.items) ? checklist.items : [];
        checklist.items.push(updateTarget);
      }
    }

    // Supports replacing the entire items array: { items: [...] }
    if (Array.isArray(data?.items)) {
      checklist.items = data.items;
    }

    await checklist.save();
    return checklist;
  }

  // ===== Offboarding Summary/Dashboard =====

  async getOffboardingPipeline(employeeId?: string) {
    const query = employeeId ? { employeeId } : {};
    return await this.terminationRequestModel.find(query).populate('employeeId').sort({ createdAt: -1 });
  }

  async getOffboardingMetrics() {
    const requests = await this.terminationRequestModel
      .find({})
      .select({ hrComments: 1, status: 1 })
      .lean();

    const extractStatusFromHrComments = (hrComments: any) => {
      if (!hrComments || typeof hrComments !== 'string') return null;
      const marker = '[STATUS]:';
      const start = hrComments.indexOf(marker);
      if (start === -1) return null;
      const afterMarker = hrComments.slice(start + marker.length).trimStart();
      const nextBlockIdx = afterMarker.search(/\n\s*\[[A-Z_]+\]:/);
      const jsonText = (nextBlockIdx === -1 ? afterMarker : afterMarker.slice(0, nextBlockIdx)).trim();
      if (!jsonText) return null;
      try {
        return JSON.parse(jsonText);
      } catch {
        return null;
      }
    };

    const normalizeStage = (stageRaw: any) => {
      const s = String(stageRaw || '').toLowerCase();
      if (!s) return 'initiated';
      if (s.includes('complete')) return 'completed';
      if (s.includes('settlement') || s.includes('pay')) return 'final_settlement';
      if (s.includes('clear')) return 'clearance';
      if (s.includes('asset')) return 'asset_return';
      if (s.includes('exit') || s.includes('interview')) return 'exit_interview';
      if (s.includes('doc')) return 'documentation';
      if (s.includes('init') || s.includes('start') || s.includes('create')) return 'initiated';
      return 'initiated';
    };

    const total = Array.isArray(requests) ? requests.length : 0;

    let completed = 0;
    (Array.isArray(requests) ? requests : []).forEach((r: any) => {
      const parsed = extractStatusFromHrComments(r?.hrComments);
      const stage = normalizeStage(parsed?.currentStage);
      if (stage === 'completed') completed += 1;
    });

    const inProgress = total - completed;
    const pending = inProgress;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }

  async getOffboardingProgress(offboardingRequestId: string) {
    const status = await this.getOffboardingStatus(offboardingRequestId);
    const exitInterview = await this.getExitInterview(offboardingRequestId);
    const assets = await this.getAssetsByOffboarding(offboardingRequestId);
    const settlement = await this.getFinalSettlement(offboardingRequestId);

    const completedStages = Array.isArray(status?.completedStages) ? status.completedStages : [];
    const normalizeStageKey = (v: any) => String(v || '')
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');
    const completedSet = new Set(completedStages.map((s: any) => normalizeStageKey(s)));
    const stageIsCompleted = (...keys: string[]) => keys.some((k) => completedSet.has(normalizeStageKey(k)));

    const exitInterviewCompleted = !!(exitInterview?.isCompleted || stageIsCompleted('exit_interview', 'exit interview', 'exit_interview_completed'));
    const assetsReturned = !!((Array.isArray(assets) ? assets.every((a: any) => a.returned) : false) || stageIsCompleted('asset_return', 'asset return', 'asset_collection', 'asset collection'));
    const settlementCompleted = !!((settlement?.settlementStatus === 'processed') || stageIsCompleted('final_settlement', 'final settlement', 'settlement'));

    const completedCount = [exitInterviewCompleted, assetsReturned, settlementCompleted].filter(Boolean).length;
    const overallProgress = completedCount === 0 ? 0 : completedCount === 1 ? 33 : completedCount === 2 ? 66 : 100;

    return {
      currentStage: status?.currentStage,
      exitInterviewCompleted,
      assetsReturned,
      settlementCompleted,
      overallProgress,
    };
  }
}
