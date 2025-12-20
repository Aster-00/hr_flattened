/**
 * DocuSeal E-Signature Service
 * Handles integration with DocuSeal for offer letter e-signatures
 */

const DOCUSEAL_API_URL = 'https://api.docuseal.com';
const DOCUSEAL_AUTH_TOKEN = process.env.DOCUSEAL_AUTH_TOKEN || '';

export interface DocuSealSubmitter {
  id: number;
  submission_id: number;
  uuid: string;
  email: string;
  slug: string;
  sent_at: string | null;
  opened_at: string | null;
  completed_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string | null;
  external_id: string | null;
  status: 'pending' | 'sent' | 'opened' | 'completed' | 'declined';
  role: string;
  embed_src: string;
  values?: { field: string; value: string }[];
  documents?: { name: string; url: string }[];
}

export interface DocuSealSubmission {
  id: number;
  name: string | null;
  source: string;
  submitters_order: string;
  slug: string;
  status: 'pending' | 'completed' | 'declined' | 'expired';
  audit_log_url: string | null;
  combined_document_url: string | null;
  expire_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  submitters: DocuSealSubmitter[];
}

export interface CreateSubmissionFromHtmlOptions {
  name: string;
  html: string;
  submitterEmail: string;
  submitterName: string;
  submitterRole?: string;
  sendEmail?: boolean;
  expireAt?: string;
  completedRedirectUrl?: string;
  values?: Record<string, string>;
}

export interface CreateSubmissionFromTemplateOptions {
  templateId: number;
  submitterEmail: string;
  submitterName: string;
  submitterRole?: string;
  sendEmail?: boolean;
  expireAt?: string;
  completedRedirectUrl?: string;
  values?: Record<string, string>;
  externalId?: string;
}

class DocuSealService {
  private authToken: string;

  constructor() {
    this.authToken = DOCUSEAL_AUTH_TOKEN;
  }

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${DOCUSEAL_API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Auth-Token': this.authToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DocuSeal API Error:', response.status, errorText);
      throw new Error(`DocuSeal API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create a signature submission from HTML content
   * This creates an offer letter document and sends it for signing
   */
  async createSubmissionFromHtml(
    options: CreateSubmissionFromHtmlOptions
  ): Promise<DocuSealSubmitter[]> {
    const {
      name,
      html,
      submitterEmail,
      submitterName,
      submitterRole = 'Candidate',
      sendEmail = false, // We handle email sending separately
      expireAt,
      completedRedirectUrl,
      values,
    } = options;

    const payload: Record<string, unknown> = {
      name,
      send_email: sendEmail,
      documents: [
        {
          name: name,
          html: html,
        },
      ],
      submitters: [
        {
          role: submitterRole,
          email: submitterEmail,
          name: submitterName,
          ...(values && { values }),
          ...(completedRedirectUrl && { completed_redirect_url: completedRedirectUrl }),
        },
      ],
    };

    if (expireAt) {
      payload.expire_at = expireAt;
    }

    return this.apiCall<DocuSealSubmitter[]>('/submissions/html', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Create a signature submission from an existing template
   */
  async createSubmissionFromTemplate(
    options: CreateSubmissionFromTemplateOptions
  ): Promise<DocuSealSubmitter[]> {
    const {
      templateId,
      submitterEmail,
      submitterName,
      submitterRole = 'First Party',
      sendEmail = false,
      expireAt,
      completedRedirectUrl,
      values,
      externalId,
    } = options;

    const payload: Record<string, unknown> = {
      template_id: templateId,
      send_email: sendEmail,
      submitters: [
        {
          role: submitterRole,
          email: submitterEmail,
          name: submitterName,
          ...(values && { values }),
          ...(completedRedirectUrl && { completed_redirect_url: completedRedirectUrl }),
          ...(externalId && { external_id: externalId }),
        },
      ],
    };

    if (expireAt) {
      payload.expire_at = expireAt;
    }

    return this.apiCall<DocuSealSubmitter[]>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get a submission by ID
   */
  async getSubmission(submissionId: number): Promise<DocuSealSubmission> {
    return this.apiCall<DocuSealSubmission>(`/submissions/${submissionId}`);
  }

  /**
   * Get a submitter by ID
   */
  async getSubmitter(submitterId: number): Promise<DocuSealSubmitter> {
    return this.apiCall<DocuSealSubmitter>(`/submitters/${submitterId}`);
  }

  /**
   * List all submissions
   */
  async listSubmissions(options?: {
    status?: 'pending' | 'completed' | 'declined' | 'expired';
    limit?: number;
  }): Promise<{ data: DocuSealSubmission[]; pagination: { count: number; next: number; prev: number } }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.apiCall(`/submissions${query}`);
  }

  /**
   * Generate offer letter HTML for DocuSeal signing
   */
  generateOfferLetterHtml(offer: {
    candidateName: string;
    role: string;
    grossSalary: number;
    signingBonus?: number;
    benefits?: string[];
    conditions?: string;
    insurances?: string;
    content?: string;
    deadline: string;
    companyName?: string;
  }): string {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedSalary = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(offer.grossSalary);

    const formattedBonus = offer.signingBonus
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(offer.signingBonus)
      : null;

    const deadlineDate = new Date(offer.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2563eb;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 24pt;
    }
    .date {
      text-align: right;
      margin-bottom: 30px;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: bold;
      color: #2563eb;
      font-size: 14pt;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 8px;
      margin: 15px 0;
    }
    .details-label {
      font-weight: bold;
      color: #555;
    }
    .benefits-list {
      margin: 10px 0;
      padding-left: 20px;
    }
    .benefits-list li {
      margin: 5px 0;
    }
    .signature-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
    }
    .signature-box {
      margin: 30px 0;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .signature-label {
      font-weight: bold;
      margin-bottom: 10px;
      color: #374151;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>JOB OFFER LETTER</h1>
    <p>${offer.companyName || 'Our Company'}</p>
  </div>

  <div class="date">
    <p>Date: ${today}</p>
  </div>

  <div class="section">
    <p>Dear <strong>${offer.candidateName}</strong>,</p>
    <p>
      We are pleased to offer you the position of <strong>${offer.role}</strong> at our company.
      We believe your skills and experience will be a valuable asset to our team.
    </p>
  </div>

  <div class="section">
    <div class="section-title">Position Details</div>
    <div class="details-grid">
      <div class="details-label">Position:</div>
      <div>${offer.role}</div>
      <div class="details-label">Start Date:</div>
      <div>As mutually agreed upon</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Compensation & Benefits</div>
    <div class="details-grid">
      <div class="details-label">Annual Salary:</div>
      <div>${formattedSalary}</div>
      ${formattedBonus ? `
      <div class="details-label">Signing Bonus:</div>
      <div>${formattedBonus}</div>
      ` : ''}
    </div>
    ${offer.benefits && offer.benefits.length > 0 ? `
    <p class="details-label">Benefits Package:</p>
    <ul class="benefits-list">
      ${offer.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}
    </ul>
    ` : ''}
    ${offer.insurances ? `
    <p><span class="details-label">Insurance Coverage:</span> ${offer.insurances}</p>
    ` : ''}
  </div>

  ${offer.conditions ? `
  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <p>${offer.conditions.replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}

  ${offer.content ? `
  <div class="section">
    <div class="section-title">Additional Information</div>
    <p>${offer.content.replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}

  <div class="section">
    <p>
      Please indicate your acceptance of this offer by signing electronically below.
      <strong>This offer expires on ${deadlineDate}.</strong>
    </p>
  </div>

  <div class="signature-section">
    <div class="section-title">Acceptance & Signature</div>
    
    <p>By signing below, I accept the terms of this offer letter and agree to join the company in the position described above.</p>

    <div class="signature-box">
      <div class="signature-label">Candidate Signature:</div>
      <signature-field name="Candidate Signature" role="Candidate" required="true" style="width: 300px; height: 60px;"></signature-field>
      
      <div class="details-grid" style="margin-top: 20px;">
        <div class="signature-label">Full Name:</div>
        <text-field name="Full Name" role="Candidate" required="true" style="width: 250px; height: 24px;">${offer.candidateName}</text-field>
        
        <div class="signature-label">Date:</div>
        <date-field name="Signing Date" role="Candidate" required="true" style="width: 150px; height: 24px;"></date-field>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This offer is contingent upon successful completion of background checks and reference verification.</p>
    <p>This document was generated electronically and is legally binding when signed.</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get the embed URL for signing an offer
   */
  getEmbedUrl(submitterSlug: string): string {
    return `https://docuseal.com/s/${submitterSlug}`;
  }
}

export const docuSealService = new DocuSealService();
export default DocuSealService;
