import {
  JobRequisition,
  JobRequisitionFormData,
  JobRequisitionStatusUpdate,
  JobTemplate,
  JobTemplateFormData,
  Employee,
  ApplicationWithDetails,
  ApplicationHistory,
  InterviewWithDetails,
  InterviewFeedback,
  Offer,
  OfferFormData,
  OfferWithDetails,
  Candidate
} from './types';
import { emailService } from './services/email.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies in requests
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle responses with no content (like DELETE operations)
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType?.includes('application/json')) {
    return undefined as T;
  }

  // Check if there's actually content to parse
  const text = await response.text();
  return text ? JSON.parse(text) : undefined as T;
}

// Job Requisition API calls
export const recruitmentApi = {
  // Create new job requisition
  createJobRequisition: async (data: JobRequisitionFormData): Promise<JobRequisition> => {
    return apiCall<JobRequisition>('/recruitment/job-requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all job requisitions
  getAllJobRequisitions: async (): Promise<JobRequisition[]> => {
    return apiCall<JobRequisition[]>('/recruitment/job-requisitions');
  },

  // Get single job requisition by ID
  getJobRequisitionById: async (id: string): Promise<JobRequisition> => {
    return apiCall<JobRequisition>(`/recruitment/job-requisitions/${id}`);
  },

  // Update job requisition
  updateJobRequisition: async (id: string, data: Partial<JobRequisitionFormData>): Promise<JobRequisition> => {
    return apiCall<JobRequisition>(`/recruitment/job-requisitions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Update job requisition status
  updateJobRequisitionStatus: async (
    id: string,
    data: JobRequisitionStatusUpdate
  ): Promise<JobRequisition> => {
    return apiCall<JobRequisition>(`/recruitment/job-requisitions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete job requisition (if supported)
  deleteJobRequisition: async (id: string): Promise<void> => {
    return apiCall<void>(`/recruitment/job-requisitions/${id}`, {
      method: 'DELETE',
    });
  },

  // Get published jobs for careers page
  getPublishedJobs: async (): Promise<JobRequisition[]> => {
    return apiCall<JobRequisition[]>('/recruitment/careers/jobs');
  },

  // Preview job requisition for careers page
  previewJobRequisition: async (id: string): Promise<JobRequisition> => {
    return apiCall<JobRequisition>(`/recruitment/job-requisitions/${id}/preview`);
  },

  // Job Template API calls
  createJobTemplate: async (data: JobTemplateFormData): Promise<JobTemplate> => {
    return apiCall<JobTemplate>('/recruitment/job-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAllJobTemplates: async (): Promise<JobTemplate[]> => {
    return apiCall<JobTemplate[]>('/recruitment/job-templates');
  },

  getJobTemplateById: async (id: string): Promise<JobTemplate> => {
    return apiCall<JobTemplate>(`/recruitment/job-templates/${id}`);
  },

  updateJobTemplate: async (id: string, data: JobTemplateFormData): Promise<JobTemplate> => {
    return apiCall<JobTemplate>(`/recruitment/job-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteJobTemplate: async (id: string): Promise<void> => {
    return apiCall<void>(`/recruitment/job-templates/${id}`, {
      method: 'DELETE',
    });
  },

  // Get employees by role (e.g., HR Managers)
  getEmployeesByRole: async (role: string): Promise<Employee[]> => {
    return apiCall<Employee[]>(`/employee-profile/roles?role=${encodeURIComponent(role)}`);
  },

  // Get all employees for selection (e.g., referral dropdown)
  getAllEmployeesForSelection: async (): Promise<Employee[]> => {
    return apiCall<Employee[]>('/employee-profile/all-for-selection');
  },

  // Candidate Profile APIs
  // Get application with full candidate details
  getApplicationById: async (applicationId: string): Promise<ApplicationWithDetails> => {
    return apiCall<ApplicationWithDetails>(`/recruitment/applications/${applicationId}`);
  },

  // Update application status (for Kanban drag-and-drop based on ApplicationStatus)
  updateApplicationStatus: async (
    applicationId: string,
    status: string,
    notes?: string,
    rejectionReason?: string
  ): Promise<{ application: ApplicationWithDetails; emailNotification?: any }> => {
    return apiCall(`/recruitment/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, rejectionReason }),
    });
  },

  // Get application history (stage/status changes)
  getApplicationHistory: async (applicationId: string): Promise<ApplicationHistory[]> => {
    return apiCall<ApplicationHistory[]>(`/recruitment/applications/${applicationId}/history`);
  },

  // Get interviews for an application
  getInterviewsByApplication: async (applicationId: string): Promise<InterviewWithDetails[]> => {
    return apiCall<InterviewWithDetails[]>(`/recruitment/applications/${applicationId}/interviews`);
  },

  // Get all interviews
  getAllInterviews: async (): Promise<InterviewWithDetails[]> => {
    return apiCall<InterviewWithDetails[]>('/recruitment/interviews');
  },

  // Get interview feedback
  getInterviewFeedback: async (interviewId: string): Promise<InterviewFeedback[]> => {
    return apiCall<InterviewFeedback[]>(`/recruitment/interviews/${interviewId}/feedback`);
  },

  // Get aggregated interview score
  getAggregatedInterviewScore: async (interviewId: string): Promise<{
    averageScore: number;
    totalFeedbacks: number;
    panelSize: number;
    submissionStatus: {
      submitted: number;
      pending: number;
    };
    results: InterviewFeedback[];
  }> => {
    return apiCall(`/recruitment/interviews/${interviewId}/aggregated-score`);
  },

  // Get interviews pending feedback for a specific interviewer (REC-011)
  getInterviewerPendingFeedback: async (interviewerId: string): Promise<InterviewWithDetails[]> => {
    return apiCall<InterviewWithDetails[]>(`/recruitment/interviewers/${interviewerId}/pending-feedback`);
  },

  // Get all applications with progress for pipeline view
  getAllApplications: async (): Promise<ApplicationWithDetails[]> => {
    return apiCall<ApplicationWithDetails[]>('/recruitment/applications');
  },

  // Update application stage (for Kanban drag-and-drop)
  updateApplicationStage: async (
    applicationId: string,
    stage: string,
    notes?: string
  ): Promise<ApplicationWithDetails> => {
    const response = await apiCall<{
      application: ApplicationWithDetails;
      emailNotification: { email: string; name: string; subject: string; message: string } | null;
    }>(`/recruitment/applications/${applicationId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, notes }),
    });

    // Send email notification via EmailJS (client-side only)
    if (response.emailNotification) {
      try {
        await emailService.sendCustomEmail(
          response.emailNotification.email,
          response.emailNotification.subject,
          response.emailNotification.message
        );
        console.log('Stage update email sent successfully to:', response.emailNotification.email);
      } catch (error) {
        console.error('Failed to send stage update email:', error);
      }
    }

    return response.application;
  },

  // Update candidate status (for Kanban drag-and-drop based on CandidateStatus)
  updateCandidateStatus: async (
    candidateId: string,
    status: string,
    notes?: string,
    applicationId?: string
  ): Promise<any> => {
    return apiCall(`/employee-profile/candidates/${candidateId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, applicationId }),
    });
  },

  // Interview Management APIs
  // Schedule a new interview (REC-010)
  scheduleInterview: async (data: {
    applicationId: string;
    stage: string;
    scheduledDate: string;
    method: string;
    panel: string[];
    videoLink?: string;
    candidateFeedback?: string;
  }): Promise<InterviewWithDetails> => {
    return apiCall<InterviewWithDetails>('/recruitment/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update an existing interview
  updateInterview: async (
    interviewId: string,
    data: {
      stage?: string;
      scheduledDate?: string;
      method?: string;
      panel?: string[];
      videoLink?: string;
      candidateFeedback?: string;
    }
  ): Promise<InterviewWithDetails> => {
    return apiCall<InterviewWithDetails>(`/recruitment/interviews/${interviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Cancel an interview
  cancelInterview: async (interviewId: string): Promise<InterviewWithDetails> => {
    return apiCall<InterviewWithDetails>(`/recruitment/interviews/${interviewId}/cancel`, {
      method: 'PATCH',
    });
  },

  // Tag candidate as referral (REC-030)
  tagCandidateAsReferral: async (
    candidateId: string,
    data: {
      referringEmployeeId: string;
      role: string;
      level: string;
    }
  ): Promise<any> => {
    return apiCall(`/recruitment/candidates/${candidateId}/referral`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Offer Management APIs (REC-014, REC-018, REC-027)
  // Create a new job offer
  createOffer: async (data: OfferFormData): Promise<Offer> => {
    return apiCall<Offer>('/recruitment/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // REC-027: Get required approver roles based on salary level
  // Helps determine which approvers (including Finance) are needed for an offer
  getRequiredApproverRoles: async (salary: number): Promise<{
    grossSalary: number;
    requiredRoles: string[];
    requiresFinanceApproval: boolean;
    requiresDepartmentHeadApproval: boolean;
  }> => {
    return apiCall<{
      grossSalary: number;
      requiredRoles: string[];
      requiresFinanceApproval: boolean;
      requiresDepartmentHeadApproval: boolean;
    }>(`/recruitment/offers/required-approvers?salary=${salary}`);
  },

  // Get offer by ID
  getOfferById: async (offerId: string): Promise<OfferWithDetails> => {
    return apiCall<OfferWithDetails>(`/recruitment/offers/${offerId}`);
  },

  // Get all offers
  getAllOffers: async (): Promise<Offer[]> => {
    return apiCall<Offer[]>('/recruitment/offers');
  },

  // Get offers pending approval for current user
  getOffersPendingApproval: async (): Promise<Offer[]> => {
    return apiCall<Offer[]>('/recruitment/offers/approvals');
  },

  // Get offers by application ID
  getOffersByApplicationId: async (applicationId: string): Promise<Offer[]> => {
    return apiCall<Offer[]>(`/recruitment/applications/${applicationId}/offers`);
  },

  // Get offers by candidate ID
  getOffersByCandidateId: async (candidateId: string): Promise<Offer[]> => {
    return apiCall<Offer[]>(`/recruitment/candidates/${candidateId}/offers`);
  },

  // Approve or reject an offer (by approver)
  updateOfferApprovalStatus: async (
    offerId: string,
    data: {
      approverId: string;
      status: 'approved' | 'rejected';
      comment?: string;
    }
  ): Promise<Offer> => {
    return apiCall<Offer>(`/recruitment/offers/${offerId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Candidate accepts the offer
  candidateAcceptOffer: async (offerId: string, candidateId: string): Promise<Offer> => {
    return apiCall<Offer>(`/recruitment/offers/${offerId}/accept`, {
      method: 'PATCH',
      body: JSON.stringify({ candidateId }),
    });
  },

  // Candidate rejects the offer
  candidateRejectOffer: async (
    offerId: string,
    candidateId: string,
    reason?: string
  ): Promise<Offer> => {
    return apiCall<Offer>(`/recruitment/offers/${offerId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ candidateId, reason }),
    });
  },

  // Generate offer letter PDF
  generateOfferLetterPdf: async (offerId: string): Promise<{ offerId: string; pdfPath: string }> => {
    return apiCall<{ offerId: string; pdfPath: string }>(`/recruitment/offers/${offerId}/generate-pdf`, {
      method: 'POST',
    });
  },

  // Send offer letter for electronic signature
  sendOfferLetterForSignature: async (offerId: string): Promise<any> => {
    return apiCall(`/recruitment/offers/${offerId}/send-for-signature`, {
      method: 'POST',
    });
  },

  // Sign offer letter
  signOfferLetter: async (
    offerId: string,
    data: {
      signerId: string;
      signerRole: 'candidate' | 'hr' | 'manager';
      signature: string;
    }
  ): Promise<Offer> => {
    return apiCall<Offer>(`/recruitment/offers/${offerId}/sign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // DocuSeal E-Signature Integration
  // ==========================================

  // Create DocuSeal submission for an offer
  createDocuSealSubmission: async (offerId: string): Promise<{
    submissionId: number;
    submitterSlug: string;
    embedUrl: string;
  }> => {
    return apiCall(`/recruitment/offers/${offerId}/docuseal/create-submission`, {
      method: 'POST',
    });
  },

  // Complete DocuSeal signature (called when candidate finishes signing)
  completeDocuSealSignature: async (
    offerId: string,
    data: {
      submissionId: number;
      documentUrl?: string;
    }
  ): Promise<Offer> => {
    return apiCall<Offer>(`/recruitment/offers/${offerId}/docuseal/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get DocuSeal signing URL for an offer
  getDocuSealSigningUrl: async (offerId: string): Promise<{
    embedUrl: string;
  }> => {
    return apiCall(`/recruitment/offers/${offerId}/docuseal/signing-url`);
  },

  // Submit assessment feedback
  submitInterviewFeedback: async (interviewId: string, data: any): Promise<any> => {
    return apiCall(`/recruitment/interviews/${interviewId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get panel member availability for calendar display
  getPanelMemberAvailability: async (
    panelMemberIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<any> => {
    return apiCall(`/recruitment/panel-members/availability`, {
      method: 'POST',
      body: JSON.stringify({
        panelMemberIds,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });
  },

  // Get signed offer letter
  getSignedOfferLetter: async (offerId: string): Promise<any> => {
    return apiCall(`/recruitment/offers/${offerId}/signed-letter`);
  },

  // Talent Pool APIs
  // Get all candidates for talent pool view
  getAllCandidates: async (): Promise<Candidate[]> => {
    return apiCall<Candidate[]>('/employee-profile/candidates');
  },

  // Email APIs
  // Send rejection email to a candidate via EmailJS (client-side)
  sendRejectionEmail: async (
    candidateEmail: string,
    candidateName: string,
    position: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Get email data from backend
      const response = await apiCall<{
        emailNotification: { email: string; name: string; subject: string; message: string };
      }>('/recruitment/email/rejection', {
        method: 'POST',
        body: JSON.stringify({ candidateEmail, candidateName, position }),
      });

      // Send email via EmailJS (client-side only)
      if (response.emailNotification) {
        const success = await emailService.sendRejectionEmail(
          response.emailNotification.email,
          response.emailNotification.name
        );
        return {
          success,
          message: success ? 'Rejection email sent successfully' : 'Failed to send rejection email',
        };
      }
      return { success: false, message: 'No email data received from server' };
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      return { success: false, message: 'Failed to send rejection email' };
    }
  },

  // Send offer letter email to a candidate via EmailJS (client-side)
  sendOfferLetterEmail: async (
    candidateEmail: string,
    candidateName: string,
    position: string,
    salary: string,
    startDate: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Get email data from backend
      const response = await apiCall<{
        emailNotification: { email: string; name: string; subject: string; message: string };
      }>('/recruitment/email/offer', {
        method: 'POST',
        body: JSON.stringify({ candidateEmail, candidateName, position, salary, startDate }),
      });

      // Send email via EmailJS (client-side only)
      if (response.emailNotification) {
        const success = await emailService.sendOfferLetter(
          response.emailNotification.email,
          response.emailNotification.name,
          position,
          salary,
          startDate
        );
        return {
          success,
          message: success ? 'Offer letter email sent successfully' : 'Failed to send offer letter email',
        };
      }
      return { success: false, message: 'No email data received from server' };
    } catch (error) {
      console.error('Failed to send offer letter email:', error);
      return { success: false, message: 'Failed to send offer letter email' };
    }
  },

  // Send offer letter email by offer ID via EmailJS (client-side)
  // This also creates a DocuSeal submission and includes the signing URL in the email
  sendOfferLetterEmailByOfferId: async (offerId: string): Promise<{ success: boolean; message: string }> => {
    try {
      // First, create DocuSeal submission to get the signing URL
      let signingUrl: string | undefined;
      try {
        const docuSealResponse = await recruitmentApi.createDocuSealSubmission(offerId);
        signingUrl = docuSealResponse.embedUrl;
        console.log('DocuSeal submission created, signing URL:', signingUrl);
      } catch (docuSealError) {
        console.warn('Failed to create DocuSeal submission, sending email without signing URL:', docuSealError);
        // Continue without signing URL if DocuSeal fails
      }

      // Get email data from backend using offer ID
      const response = await apiCall<{
        emailNotification: { email: string; name: string; position: string; salary: string; startDate: string };
      }>(`/recruitment/offers/${offerId}/email-data`, {
        method: 'GET',
      });

      // Send email via EmailJS (client-side only) with the signing URL
      if (response.emailNotification) {
        const { email, name, position, salary, startDate } = response.emailNotification;
        const success = await emailService.sendOfferLetter(email, name, position, salary, startDate, signingUrl);
        return {
          success,
          message: success ? 'Offer letter email sent successfully' : 'Failed to send offer letter email',
        };
      }
      return { success: false, message: 'No email data received from server' };
    } catch (error) {
      console.error('Failed to send offer letter email by offer ID:', error);
      return { success: false, message: 'Failed to send offer letter email' };
    }
  },
};
