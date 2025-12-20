/**
 * REC-027: Approver Role Types for Offer Approval Workflow
 * BR 26b: The system must support securing related parties' approval before sending out the offer
 */
export enum ApproverRole {
  HR_MANAGER = 'HR Manager',
  HIRING_MANAGER = 'Hiring Manager',
  FINANCE = 'Finance',
  DEPARTMENT_HEAD = 'Department Head',
  EXECUTIVE = 'Executive',
}

/**
 * REC-027: Salary thresholds for financial approval requirements
 */
export const FINANCIAL_APPROVAL_THRESHOLDS = {
  STANDARD_MAX: 100000,  // Up to 100k - HR + Hiring Manager only
  SENIOR_MAX: 200000,    // 100k-200k - requires Finance approval
  // Above 200k requires Finance + Department Head approval
};

export interface JobRequisition {
  _id: string;
  requisitionId: string;
  templateId?: string | JobTemplate;
  openings: number;
  location: string;
  hiringManagerId: string;
  publishStatus: 'draft' | 'published' | 'closed';
  postingDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data types (what we send to backend)
export interface JobRequisitionFormData {
  requisitionId?: string;
  templateId?: string;
  openings: number;
  location: string;
  hiringManagerId: string;
  expiryDate?: string;
}

export interface JobRequisitionStatusUpdate {
  status: 'draft' | 'published' | 'closed';
}

export interface Application {
  _id: string;
  jobRequisitionId: string;
  candidateId: string;
  stage: string;
  status: string;
  progress: number;
  resumeUrl?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  _id: string;
  applicationId: string;
  scheduledDate: string;
  mode: 'in-person' | 'video' | 'phone';
  panel: string[];
  videoLink?: string;
  status: string;
}

export interface Offer {
  _id: string;
  applicationId: string;
  candidateId: string;
  hrEmployeeId?: string;
  grossSalary: number;
  signingBonus?: number;
  benefits?: string[];
  conditions?: string;
  insurances?: string;
  content: string;
  role: string;
  deadline: string;
  applicantResponse: 'accepted' | 'rejected' | 'pending';
  approvers: Array<{
    employeeId: string;
    role: string;
    status: 'approved' | 'rejected' | 'pending';
    actionDate?: string;
    comment?: string;
  }>;
  finalStatus: 'approved' | 'rejected' | 'pending';
  candidateSignedAt?: string;
  hrSignedAt?: string;
  managerSignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferFormData {
  applicationId: string;
  candidateId: string;
  hrEmployeeId?: string;
  grossSalary: number;
  signingBonus?: number;
  benefits?: string[];
  conditions?: string;
  insurances?: string;
  content: string;
  role: string;
  deadline: string;
  approvers?: Array<{
    employeeId: string;
    role: string;
  }>;
}

export interface OfferWithDetails extends Omit<Offer, 'candidateId' | 'applicationId' | 'hrEmployeeId'> {
  candidateId: Candidate;
  applicationId: ApplicationWithDetails;
  hrEmployeeId?: Employee;
}

export interface JobTemplate {
  _id: string;
  title: string;
  department: string;
  qualifications: string[];
  skills: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobTemplateFormData {
  title: string;
  department: string;
  qualifications: string[];
  skills: string[];
  description?: string;
}

export interface Employee {
  _id: string;
  employeeNumber: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
  };
  workEmail?: string;
  systemRole?: string[];
}

export interface Candidate {
  _id: string;
  candidateNumber: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  address?: {
    city?: string;
    streetAddress?: string;
    country?: string;
  };
  departmentId?: string;
  positionId?: string;
  applicationDate?: string;
  status?: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl?: string;
  notes?: string;
  profilePictureUrl?: string;
  password?: string;
  accessProfileId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationWithDetails {
  _id: string;
  candidateId: Candidate;
  requisitionId: {
    _id: string;
    requisitionId: string;
    location: string;
    openings: number;
    publishStatus: string;
    templateId: {
      _id: string;
      title: string;
      department: string;
      qualifications: string[];
      skills: string[];
    };
  };
  assignedHr?: {
    _id: string;
    employeeNumber: string;
    firstName?: string;
    lastName?: string;
    workEmail?: string;
  };
  currentStage: string;
  status: string;
  resumeUrl?: string;
  coverLetter?: string;
  applicationDate?: string;
  createdAt: string;
  updatedAt: string;
  isReferral?: boolean;
  referralDetails?: {
    referringEmployeeId: string;
    role: string;
    level: string;
  };
}

export interface ApplicationHistory {
  _id: string;
  applicationId: string;
  oldStage?: string;
  newStage?: string;
  oldStatus?: string;
  newStatus?: string;
  changedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  changedAt: string;
  notes?: string;
  createdAt: string;
}

export interface InterviewWithDetails {
  _id: string;
  applicationId: string | ApplicationWithDetails;
  stage: string;
  scheduledDate: string;
  method: string;
  panel: Array<{
    _id: string;
    employeeNumber: string;
    firstName?: string;
    lastName?: string;
    workEmail?: string;
  }>;
  videoLink?: string;
  candidateFeedback?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  _id: string;
  interviewId: string;
  interviewerId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  score: number;
  comments?: string;
  createdAt: string;
}

export interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore?: number;
  weight?: number;
  comments?: string;
}

export interface SubmitAssessmentPayload {
  interviewId: string;
  applicationId: string;
  interviewerId: string;
  criteriaScores: CriteriaScore[];
  totalScore?: number;
  maxTotalScore?: number;
  percentageScore?: number;
  overallComments?: string;
  recommendation?: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend' | 'strongly_not_recommend';
}
