# Recruitment-Ammar Frontend Components

This directory contains all frontend components for the Recruitment module of the HR system.

## Component Structure

### 1. Job Design & Posting Components

#### JobTemplateManager ✅ FULLY IMPLEMENTED
- **Purpose**: Create and manage standardized job description templates (REC-003)
- **Location**: [frontend/src/app/recruitment/jobs/templates/page.tsx](frontend/src/app/recruitment/jobs/templates/page.tsx)
- **Backend APIs**: ✅ ALL WORKING
  - `POST /recruitment/job-templates` - Create new job template ✅
  - `GET /recruitment/job-templates` - Get all templates ✅
  - `GET /recruitment/job-templates/:id` - Get single template ✅
  - `PATCH /recruitment/job-templates/:id` - Update template ✅
  - `DELETE /recruitment/job-templates/:id` - Delete template ✅
- **Service Methods** ([services.ts](frontend/src/app/recruitment/services.ts)): ✅ ALL IMPLEMENTED
  - `createJobTemplate()` - Create template (BR 2) ✅
  - `getAllJobTemplates()` - Get all templates ✅
  - `getJobTemplateById()` - Get single template ✅
  - `updateJobTemplate()` - Update existing template ✅
  - `deleteJobTemplate()` - Delete template ✅
- **Features**: ✅ ALL WORKING
  - Template creation form with fields for title, department, description ✅
  - Qualifications array (add/remove individual items) ✅
  - Skills array (add/remove individual items) ✅
  - Enter key support for adding qualifications/skills ✅
  - Template list view with edit/delete actions ✅
  - Inline editing (form appears when editing) ✅
  - Confirmation dialog on delete ✅
  - Error handling with error message display ✅
- **Access**: HR Manager only
- **Implementation Status**: ✅ **100% COMPLETE**

#### HiringProcessTemplateManager
- **Purpose**: Configure hiring process stages and templates (REC-004)
- **Backend APIs**:
  - `PATCH /recruitment/applications/:id/stage` - Update application stage
  - `GET /recruitment/applications/:id/progress` - Get progress & history
  - `GET /recruitment/applications` - Get all applications
  - `GET /recruitment/applications/by-stage/:stage` - Filter by stage
  - `GET /recruitment/applications/:id/history` - Get stage history
- **Service Methods**:
  - `updateApplicationStage()` - Update stage & calculate progress % (BR 9)
  - `getApplicationProgress()` - Get current stage, progress, history
  - `getAllApplicationsWithProgress()` - Get all with stages
  - `getApplicationsByStage()` - Filter by specific stage
  - `getApplicationHistory()` - Complete stage transition history
  - `updateApplicationStatus()` - Update status (REJECTED, HIRED, etc.) (BR 11)
- **Features**:
  - Stage definition (Screening, Shortlisting, Interview, Offer, Hired)
  - Drag-and-drop stage reordering
  - Progress percentage configuration
  - Template assignment to job postings
- **Access**: HR Manager, HR Employee, Recruiter

#### JobRequisitionManager ✅ FULLY IMPLEMENTED
- **Purpose**: Create, manage, and publish job requisitions using templates (REC-023)
- **Note**: Uses templates from REC-003 (JobTemplateManager) to create actual job postings
- **Location**: [frontend/src/app/recruitment/jobs/requisition/page.tsx](frontend/src/app/recruitment/jobs/requisition/page.tsx)
- **Backend APIs**: ✅ ALL IMPLEMENTED
  - `POST /recruitment/job-requisitions` - Create new job requisition
  - `GET /recruitment/job-requisitions` - Get all job requisitions
  - `GET /recruitment/job-requisitions/:id` - Get single requisition
  - `PATCH /recruitment/job-requisitions/:id` - Update requisition
  - `PATCH /recruitment/job-requisitions/:id/status` - Update publish status
  - `DELETE /recruitment/job-requisitions/:id` - Delete requisition ✅ **NEWLY ADDED**
  - `GET /recruitment/careers/jobs` - Get published jobs (PUBLIC - no auth)
  - `GET /recruitment/job-requisitions/:id/preview` - Preview careers page format
  - `GET /employee-profile/roles?role=HR Manager` - Get HR Managers list
- **Service Methods** ([services.ts](frontend/src/app/recruitment/services.ts)): ✅ ALL IMPLEMENTED
  - `createJobRequisition()` - Create new requisition with auto-generated ID (BR 2)
  - `getAllJobRequisitions()` - Get all requisitions with populated template data
  - `getJobRequisitionById()` - Get single requisition
  - `updateJobRequisition()` - Update existing requisition
  - `updateJobRequisitionStatus()` - Update publish status (draft/published/closed)
  - `deleteJobRequisition()` - Delete requisition ✅ **NEWLY ADDED**
  - `getPublishedJobs()` - Get all published for careers page (BR 6)
  - `previewJobRequisition()` - Preview formatted posting (BR 6)
  - `getEmployeesByRole()` - Fetch employees by system role
- **Features**: ✅ ALL WORKING
  - Create/Edit requisition form with inline toggle ✅
  - Auto-generated requisition ID (REQ-{timestamp}) if not provided ✅
  - Job template selection (optional, dropdown from templates) ✅
  - Hiring manager selection (required, dropdown of HR Managers) ✅
  - Location input (required) ✅
  - Number of openings (required, min 1) ✅
  - Expiry date (optional) ✅
  - Requisition list view with cards showing:
    - Requisition ID, location, openings count ✅
    - Template reference (if used) ✅
    - Expiry date ✅
    - Status badge (draft/published/closed with color coding) ✅
  - Inline status change dropdown (draft → published → closed) ✅
  - Edit button (loads data into form) ✅
  - Delete button with confirmation ✅ **FIXED - handles empty response properly**
  - Error handling with error message display ✅
  - Loading states ✅
  - Handles both populated and non-populated template/manager data ✅
- **Access**: HR Manager, HR Employee
- **Recent Updates**:
  - ✅ **2024-12-15**: Added DELETE endpoint to backend ([recruitment.controller.ts:119-123](backend/src/recruitment/recruitment.controller.ts#L119-L123))
  - ✅ **2024-12-15**: Implemented `deleteJobRequisition()` service method with safety checks ([recruitment.service.ts:162-179](backend/src/recruitment/recruitment.service.ts#L162-L179))
  - ✅ **2024-12-15**: Fixed `apiCall()` helper to handle empty responses from DELETE operations ([services.ts:41-49](frontend/src/app/recruitment/services.ts#L41-L49))
  - **Safety Feature**: Prevents deletion of requisitions with associated applications (returns error message suggesting to close instead)

### 2. Candidate Application & Communication Components

#### CandidateApplicationForm
- **Purpose**: Allow candidates to apply for positions (REC-007)
- **Backend APIs**:
  - `POST /recruitment/applications` (via submitApplication) - Submit application with CV
  - `GET /recruitment/applications/:id` - Get application details
- **Service Methods**:
  - `submitApplication()` - Submit with CV/resume and GDPR consent validation (BR 12, BR 28, NFR-33)
  - `getTalentPool()` - Get all applications in talent pool
  - `searchTalentPool()` - Search/filter by job, stage, candidate, dates
  - `getApplicationById()` - Get specific application details
  - `getApplicationsByCandidate()` - Get all for a candidate
  - `getApplicationsByJobRequisition()` - Get all for job (with referral prioritization)
- **Features**:
  - CV/resume upload (multiple formats: PDF, DOC, DOCX)
  - Personal information form
  - Cover letter text area
  - GDPR consent checkbox (required)
  - Application submission with automatic confirmation notification
  - File validation and size limits
- **Access**: Public/Candidate

#### CandidateStatusTracker
- **Purpose**: Display application status to candidates (REC-017)
- **Backend APIs**:
  - `GET /recruitment/candidate/:candidateId/applications` - Get applications with status
  - `GET /recruitment/candidate/:candidateId/applications/:applicationId` - Get detailed status
  - `GET /recruitment/candidate/:candidateId/notifications` - Get notifications
- **Service Methods**:
  - `getCandidateApplicationsWithStatus()` - Get with progress tracking (BR 27, BR 36)
  - `getCandidateApplicationStatus()` - Get detailed status for specific application
  - `getCandidateNotifications()` - Get application update notifications
- **Features**:
  - Real-time status visualization
  - Progress bar/timeline view (auto-calculated %)
  - Stage-by-stage breakdown
  - Last updated timestamp
  - Notification history
  - Recent history (last 5 updates)
- **Access**: Candidate (Job Candidate role)

#### RejectionTemplateManager
- **Purpose**: Create and manage rejection email templates (REC-022)
- **Backend APIs**:
  - Uses `updateApplicationStatus()` with rejectionReason parameter
- **Service Methods**:
  - `updateApplicationStatus()` - Update to REJECTED with reason & automated notification
- **Features**:
  - Template editor with placeholders
  - Template categorization by stage/reason
  - Preview functionality
  - Send rejection notifications (automated)
  - Communication log storage (via Logger)
- **Access**: HR Manager, HR Employee

### 3. Candidate Tracking & Evaluation Components

#### CandidatePipeline ✅ FULLY IMPLEMENTED
- **Purpose**: Track candidates through hiring stages (REC-008)
- **Location**: [frontend/src/app/recruitment/candidates/pipeline/page.tsx](frontend/src/app/recruitment/candidates/pipeline/page.tsx)
- **Backend APIs**: ✅ ALL WORKING
  - Uses application stage tracking APIs (same as REC-004) ✅
  - `GET /recruitment/applications/by-stage/:stage` - Get by stage ✅
  - `GET /recruitment/applications` - Get all applications ✅
  - `PATCH /recruitment/applications/:id/stage` - Update stage ✅
- **Service Methods**: ✅ ALL IMPLEMENTED
  - `getAllApplications()` - Get all with current stage ✅
  - `getApplicationsByStage()` - Filter by specific stage ✅
  - `updateApplicationStage()` - Move to different stage (drag-drop) ✅
- **Features**: ✅ ALL WORKING
  - Kanban board view of candidates by stage ✅
  - Drag-and-drop to move candidates (updates stage) ✅ (@dnd-kit/core implementation)
  - **Search functionality** ✅ (2024-12-16)
    - Real-time search by candidate name, ID, job title, or email ✅
    - Search results display count (showing X / Total) ✅
    - Filtered results update across all stage columns ✅
  - Candidate cards with key information ✅ (CandidateCard.tsx)
    - Candidate name and ID ✅
    - Job title and location ✅
    - Application status badge with color coding ✅
    - Referral badge (⭐ Referral) for referred candidates ✅
    - Application date ✅
    - Assigned HR information ✅
    - Contact info (email, phone) ✅
    - Mark as Referral button (with employee selection) ✅
    - Send Rejection Email button ✅
  - Stage columns with counts ✅ (KanbanColumn.tsx)
    - Visual drop zones with hover states ✅
    - Stage-specific color coding ✅
    - Empty state handling ✅
  - Click candidate card to open profile side panel ✅
  - Optimistic UI updates with error rollback ✅
  - Stage-wise candidate count ✅
  - Refresh button ✅
  - Total applications counter ✅
- **Access**: HR Manager, HR Employee, Recruiter
- **Implementation Status**: ✅ **100% COMPLETE**
- **Components**:
  - [page.tsx](frontend/src/app/recruitment/candidates/pipeline/page.tsx) - Main Kanban board ✅
  - [KanbanColumn.tsx](frontend/src/app/recruitment/candidates/pipeline/KanbanColumn.tsx) - Droppable column ✅
  - [CandidateCard.tsx](frontend/src/app/recruitment/candidates/pipeline/CandidateCard.tsx) - Draggable card ✅

#### InterviewScheduler
- **Purpose**: Schedule and manage interviews (REC-010)
- **Backend APIs**:
  - `POST /recruitment/interviews` - Schedule interview
  - `GET /recruitment/applications/:applicationId/interviews` - Get all interviews
  - `PATCH /recruitment/interviews/:id` - Update interview
  - `PATCH /recruitment/interviews/:id/cancel` - Cancel interview
- **Service Methods**:
  - `scheduleInterview()` - Schedule with auto calendar invites & notifications (BR 19a, c, d)
    - Validates panel member availability (checks leave status)
    - Detects scheduling conflicts (existing interviews)
    - Notifies panel members with calendar invite
    - Notifies candidates automatically
  - `getInterviewsByApplication()` - Get all for application
  - `updateInterview()` - Update & re-notify if schedule changes
  - `cancelInterview()` - Cancel & notify all participants
- **Features**:
  - Calendar integration
  - Time slot selection
  - Panel member selection with availability validation
  - Interview mode selection (in-person, video, phone)
  - Automatic calendar invites to interviewers
  - Candidate notification system
  - Availability checker (integrates with leave management)
  - Video link field for virtual interviews
- **Access**: HR Manager, HR Employee, Recruiter

#### InterviewFeedbackForm
- **Purpose**: Collect interview feedback and scores (REC-011, REC-020)
- **Backend APIs**:
  - `POST /recruitment/interviews/:id/feedback` - Submit feedback
  - `GET /recruitment/interviews/:id/feedback` - Get all feedback
  - `GET /recruitment/interviews/:id/aggregated-score` - Get aggregated scores
  - `GET /recruitment/interviewers/:id/pending-feedback` - Get pending for interviewer
- **Service Methods**:
  - `submitInterviewFeedback()` - Submit scores & comments (validates panel membership) (BR 10, BR 22)
  - `getInterviewFeedback()` - Get all feedback for interview
  - `getAggregatedInterviewScore()` - Get average score, submission status, panel stats
  - `getInterviewerPendingFeedback()` - Get interviews needing feedback
- **Features**:
  - Structured assessment forms per role
  - Rating scales and scoring criteria (0-100)
  - Comments section
  - File attachments for notes
  - Submit and save draft options (update existing feedback)
  - Feedback history view
  - Automatic HR notification on submission
- **Access**: HR Manager, HR Employee, Recruiter, Panel Members

#### InterviewPanelCoordinator
- **Purpose**: Manage interview panels (REC-021)
- **Backend APIs**:
  - Same as InterviewScheduler and InterviewFeedbackForm
- **Service Methods**:
  - `scheduleInterview()` - With panel array
  - `getAggregatedInterviewScore()` - Track submission status
  - `getInterviewerPendingFeedback()` - Monitor pending feedbacks
- **Features**:
  - Panel member selection
  - Availability calendar view (leave integration)
  - Panel member roles/responsibilities
  - Scoring dashboard (aggregated scores)
  - Feedback collection status (submitted vs pending)
  - Panel member notifications (automatic)
- **Access**: HR Manager, HR Employee, Recruiter

#### ReferralTaggingInterface ✅ FULLY IMPLEMENTED
- **Purpose**: Tag and prioritize referral candidates (REC-030)
- **Location**: Integrated into [CandidateCard.tsx](frontend/src/app/recruitment/candidates/pipeline/CandidateCard.tsx)
- **Backend APIs**: ✅ ALL WORKING
  - `POST /recruitment/candidates/:candidateId/referral` - Tag as referral ✅
  - `GET /recruitment/applications` - Returns applications with referral information ✅
  - `GET /recruitment/applications/by-job/:jobId` - Returns referrals first ✅
- **Service Methods**: ✅ ALL IMPLEMENTED
  - `tagCandidateAsReferral()` - Tag candidate as referral (BR 14, BR 25) ✅
  - `getAllApplications()` - Returns applications with isReferral and referralDetails fields ✅
  - `getApplicationsByJobRequisition()` - Sorts referrals to top automatically ✅
- **Features**: ✅ ALL WORKING
  - Mark as Referral button on each candidate card ✅
  - Employee selection modal for choosing referring employee ✅
  - Role and level input for referral tracking ✅
  - Referral badge display (⭐ Referral) with purple styling ✅
  - Referral status persists on page reload ✅
  - Backend includes referral data in getAllApplications response ✅
  - Automatic refresh after marking as referral ✅
- **Access**: HR Manager, HR Employee
- **Implementation Status**: ✅ **100% COMPLETE**
- **Recent Updates**:
  - ✅ **2024-12-16**: Modified backend to include referral information when fetching all applications
  - ✅ **2024-12-16**: Updated ApplicationWithDetails type to include isReferral and referralDetails fields
  - ✅ **2024-12-16**: Fixed frontend to use backend referral data instead of local state
  - ✅ **2024-12-16**: Added search functionality to CandidatePipeline (search by name, ID, job, email)

### 4. Recruitment Analytics Components

#### RecruitmentDashboard
- **Purpose**: Monitor recruitment progress and analytics (REC-009)
- **Backend APIs**:
  - `GET /recruitment/analytics/kpis` - Comprehensive KPIs dashboard
  - `GET /recruitment/analytics/time-to-hire` - Time-to-hire report
  - `GET /recruitment/analytics/funnel` - Recruitment funnel data
  - `GET /recruitment/analytics/offer-acceptance` - Offer acceptance rates
  - `GET /recruitment/analytics/interview-to-offer` - Interview to offer ratio
  - `GET /recruitment/analytics/applications/:id/time-to-hire` - Individual app time-to-hire
- **Service Methods**:
  - `getRecruitmentKPIs()` - Complete dashboard data (BR 33)
    - Overview: total apps, open positions, active interviews, pending offers, total hired
    - Time-to-hire: average & median
    - Conversion rates: screening→interview, interview→offer, offer→hire
    - Applications by stage & status
  - `getTimeToHireReport()` - Stats: avg, median, min, max, per-application breakdown
  - `calculateTimeToHire()` - Individual application metric
  - `getRecruitmentFunnelData()` - Funnel with conversion rates at each stage
  - `getOfferAcceptanceRate()` - Acceptance/rejection metrics
  - `getInterviewToOfferRatio()` - Conversion from interviews to offers
- **Features**:
  - Open positions overview
  - Time-to-hire metrics (avg, median, min, max)
  - Source effectiveness charts
  - Stage conversion rates (%)
  - Candidate pipeline statistics
  - Export reports functionality
  - Date range filters
  - Job/department filters
- **Access**: HR Manager, HR Employee

#### RecruitmentReports
- **Purpose**: Generate detailed recruitment reports (REC-009)
- **Backend APIs**:
  - Same as RecruitmentDashboard
- **Service Methods**:
  - All analytics methods from above
  - Returns detailed breakdowns per application
- **Features**:
  - Time-to-hire report (with per-candidate breakdown)
  - Source effectiveness report
  - Candidate funnel analysis (stage counts & conversion %)
  - Interview performance metrics
  - Offer acceptance rates (accepted, rejected, pending counts)
  - Custom report builder (date range, job filters)
  - Export to PDF/Excel
- **Access**: HR Manager, HR Employee

### 5. Compliance & Background Checks Components

#### ConsentManagement
- **Purpose**: Collect candidate consent for data processing (REC-028)
- **Backend APIs**:
  - `GET /recruitment/candidates/:candidateId/export-personal-data` - Export data (GDPR Article 15)
  - `POST /recruitment/candidates/:candidateId/delete-personal-data` - Delete/anonymize data (GDPR Article 17)
  - `GET /recruitment/candidates/:candidateId/consent-history` - Get consent audit trail
  - `GET /recruitment/admin/retention-cleanup` - Find old applications for cleanup
  - `POST /recruitment/applications` (submitApplication) - Validates consent on submission
- **Service Methods**:
  - `exportPersonalData()` - Export all candidate data (BR 28, NFR-33)
    - Returns: applications, interviews, assessments, offers, history, GDPR notice
  - `deletePersonalData()` - Anonymize personal data (Right to be Forgotten)
    - Validates no active applications
    - Anonymizes: applications, interviews, assessments, offers
    - Keeps records for referential integrity
  - `getConsentHistory()` - Audit trail of all consent given
  - `getApplicationsForRetentionCleanup()` - Find apps older than retention period (default: 2 years)
  - `submitApplication()` - Requires consent validation before accepting
    - consentGiven, consentDataProcessing, consentBackgroundCheck
    - Stores IP address and timestamp
- **Features**:
  - GDPR-compliant consent forms (required on application)
  - Privacy policy display
  - Background check authorization
  - Consent history tracking (all consents with timestamps)
  - Withdrawal of consent option (data deletion request)
  - Audit trail (consent timestamp, IP address)
  - Data export functionality
  - Right to erasure/be forgotten
- **Access**: Candidate (self), HR Manager, HR Employee

### 6. Offers & Hiring Decisions Components

#### OfferLetterGenerator
- **Purpose**: Create and send offer letters (REC-018)
- **Backend APIs**:
  - `POST /recruitment/offers/:id/generate-pdf` - Generate PDF offer letter
  - `POST /recruitment/offers/:id/send-for-signature` - Send for e-signature
  - `POST /recruitment/offers/:id/sign` - Record electronic signature
  - `GET /recruitment/offers/:id/signed-letter` - Get fully executed offer
- **Service Methods**:
  - `generateOfferLetterPdf()` - Generate PDF with compensation/benefits (BR 26a)
    - Uses PDFKit to create formatted offer letter
    - Includes: position details, compensation, benefits, terms, signature section
  - `sendOfferLetterForSignature()` - Send offer & log communication (BR 26d, BR 37)
    - Generates PDF, sends notification to candidate
    - Logs communication in system
  - `recordSignature()` - Record e-signature from Signature Pad (BR 26d, BR 37)
    - Supports: candidate, HR, manager signatures
    - Saves signature images (base64 → PNG files)
    - Logs signature timestamp and signer info
  - `getSignedOfferLetter()` - Get offer with all signatures (BR 37)
    - Returns PDF path, signature details, fully executed status
- **Features**:
  - Customizable offer letter templates
  - Compensation and benefits editor
  - Preview before sending (PDF generation)
  - Electronic signature integration (Signature Pad)
  - Send offer to candidate (automated notification)
  - Track offer status (sent, viewed, accepted, rejected)
  - Multi-party signatures (candidate, HR, manager)
- **Access**: HR Manager, HR Employee (create/send), Candidate (sign own)

#### OfferApprovalWorkflow
- **Purpose**: Manage offer approvals (REC-014)
- **Backend APIs**:
  - `POST /recruitment/offers` - Create offer with approvers
  - `GET /recruitment/offers/:id` - Get offer details
  - `GET /recruitment/offers` - Get all offers
  - `GET /recruitment/applications/:applicationId/offers` - Get by application
  - `GET /recruitment/candidates/:candidateId/offers` - Get by candidate
  - `PATCH /recruitment/offers/:id/approve` - Approve/reject offer
  - `PATCH /recruitment/offers/:id/accept` - Candidate accepts
  - `PATCH /recruitment/offers/:id/reject` - Candidate rejects
- **Service Methods**:
  - `createOffer()` - Create with multi-level approval workflow (BR 26b)
    - Initializes approvers with PENDING status
    - Updates application status to OFFER
    - Notifies all approvers
  - `updateOfferApprovalStatus()` - Approve/reject by approver (BR 26b)
    - Validates approver is in list
    - Tracks approval chain (all approved? any rejected?)
    - Auto-sends to candidate when fully approved
  - `candidateAcceptOffer()` - Accept & trigger onboarding (BR 26c)
    - Updates to HIRED status
    - Automatically calls triggerOnboarding()
  - `candidateRejectOffer()` - Reject offer
    - Updates application to REJECTED
    - Notifies HR and hiring manager
  - `getAllOffers()`, `getOfferById()`, etc. - Various getters
- **Features**:
  - Approval request form (create offer with approvers array)
  - Approver chain display (list of approvers with status)
  - Approval status tracking (pending/approved/rejected per approver)
  - Comments/feedback section (approver comments)
  - Notification system (automated notifications at each step)
  - Conditional approval rules (any rejected = offer rejected, all approved = send to candidate)
  - Final status tracking (PENDING/APPROVED/REJECTED)
- **Access**: HR Manager, HR Employee (create), Department Head/Approvers (approve), Candidate (accept/reject)

#### PreboardingTaskManager
- **Purpose**: Trigger pre-boarding tasks after offer acceptance (REC-029)
- **Backend APIs**:
  - `GET /recruitment/onboarding/employee/:employeeId` - Get onboarding progress
  - `GET /recruitment/onboarding/all` - Get all onboardings (HR dashboard)
  - `PATCH /recruitment/onboarding/:onboardingId/tasks` - Update task status
  - `POST /recruitment/onboarding/:onboardingId/documents` - Upload task document
- **Service Methods**:
  - `triggerOnboarding()` - **Auto-triggered** when candidate accepts offer (BR 26c)
    - Creates contract record from accepted offer
    - Creates onboarding record with pre-boarding tasks
    - Calls createPreboardingTasks() to generate task list
    - Notifies candidate and HR
  - `createPreboardingTasks()` - Generate standardized task checklist
    - Standard tasks: sign contract, tax forms, upload docs, handbook, background check, direct deposit, benefits
    - Role-specific tasks (e.g., IT setup for engineers)
    - Auto-calculates deadlines based on start date
  - `getOnboardingProgress()` - Get progress for employee
  - `getAllOnboardings()` - HR dashboard view
  - `updateTaskStatus()` - Mark tasks as pending/in_progress/completed
    - Auto-marks onboarding complete when all tasks done
  - `uploadOnboardingDocument()` - Attach documents to tasks
- **Features**:
  - Task checklist creation (automatic on offer acceptance)
  - Automated task assignment (role-based)
  - Document upload requirements
  - Contract signing integration (creates contract record)
  - Task completion tracking (status + completion timestamp)
  - Onboarding module handoff (triggers on acceptance)
  - Progress percentage calculation
  - Deadline tracking per task
- **Access**: Employee (self), HR Manager, HR Employee, Candidate (for own onboarding)

### 7. Careers Page Components

#### PublicJobBoard (CareersPage) ✅ FULLY IMPLEMENTED
- **Purpose**: Display open positions on careers page (REC-023)
- **Location**: [frontend/src/app/recruitment/jobs/careers/page.tsx](frontend/src/app/recruitment/jobs/careers/page.tsx)
- **Backend APIs**: ✅ ALL WORKING
  - `GET /recruitment/careers/jobs` - Get all published jobs (PUBLIC - no auth required) ✅
  - `POST /recruitment/careers/apply` - Submit job application (PUBLIC) ✅
- **Service Methods**: ✅ IMPLEMENTED
  - `getPublishedJobRequisitions()` - Get all published jobs for careers page (BR 6) ✅
    - Filters by publishStatus: 'published'
    - Populates template data (title, department, qualifications, skills)
    - Sorted by posting date (newest first)
- **Features**: ✅ ALL WORKING
  - **Job Listing** ✅
    - Job listing card view with professional styling ✅
    - Job cards showing: title, department, location, openings, posting date ✅
    - Expiry date display (when available) ✅
    - Expandable job details (click to expand/collapse) ✅
    - Qualifications and skills sections (separate lists) ✅
    - Job description with fallback generation ✅
    - Hover effects on job cards ✅
    - Responsive design ✅
    - Loading and error states ✅
    - Empty state handling ("No Open Positions") ✅
    - Data transformation layer (backend JobRequisition → frontend JobPosting) ✅
  - **Application Form Modal** ✅
    - Full application form with personal information ✅
    - Name fields (first, middle, last) ✅
    - Email and phone (required) ✅
    - Date of birth and gender ✅
    - Address fields (city, street, country) ✅
    - Resume/CV URL input (required) ✅
    - Cover letter textarea (optional) ✅
    - Form validation ✅
    - Submit and Cancel buttons ✅
    - Loading states during submission ✅
    - Success message with auto-close ✅
    - Error handling and display ✅
    - Modal overlay with click-outside to close ✅
  - **Employer Branding** ✅
    - Header section with title and tagline ✅
    - Professional color scheme ✅
- **Access**: Public (no authentication required)
- **Implementation Status**: ✅ **100% COMPLETE**
- **Recent Updates**:
  - ✅ **2024-12-15**: Fixed TypeError "Cannot read properties of undefined (reading 'map')"
  - ✅ **2024-12-15**: Added proper TypeScript types for `JobTemplate`, `JobRequisition`, and `JobPosting`
  - ✅ **2024-12-15**: Implemented data transformation to handle populated `templateId` field
  - ✅ **2024-12-15**: Split requirements into Qualifications and Required Skills sections
  - ✅ **2024-12-15**: Changed job type display to show number of openings
  - ✅ **2024-12-15**: Added safe default arrays for qualifications/skills to prevent map errors
  - ✅ **2024-12-15**: Added expiry date display with clock icon for job postings
  - ✅ **2024-12-15**: Implemented full application form modal with all required fields

#### JobDetailView
- **Purpose**: Display detailed job information (REC-023)
- **Note**: Currently integrated into CareersPage as expandable job cards
- **Backend APIs**:
  - `GET /recruitment/job-requisitions/:id/preview` - Preview formatted for careers
- **Service Methods**:
  - `previewJobRequisitionForCareers()` - Get formatted job posting (BR 6)
    - Returns formatted data: title, department, location, openings, qualifications, skills, dates
    - Professional preview before publishing
- **Features**:
  - Complete job description (from template) ✅ (via CareersPage)
  - Requirements and qualifications ✅ (via CareersPage)
  - Application form integration ✅
  - Expiry date display ✅
- **Access**: Public (no auth)

### 8. Shared/Common Components

#### CandidateProfile ✅ FULLY IMPLEMENTED
- **Purpose**: Display comprehensive candidate information
- **Location**: [frontend/src/app/recruitment/components/CandidateProfile.tsx](frontend/src/app/recruitment/components/CandidateProfile.tsx)
- **Backend APIs**: ✅ ALL WORKING
  - `GET /recruitment/applications/:id` - Get application with candidate data ✅
  - `GET /recruitment/applications/:id/history` - Get status change history ✅
  - `GET /recruitment/applications/:applicationId/interviews` - Get interviews ✅
  - `GET /recruitment/interviews/:id/feedback` - Get interview feedback ✅
  - `PATCH /recruitment/applications/:id/stage` - Update stage ✅
- **Service Methods**: ✅ ALL IMPLEMENTED
  - `getApplicationById()` - Get full application details (populated with candidate, job, HR) ✅
  - `getApplicationHistory()` - Get complete stage/status history ✅
  - `getInterviewsByApplication()` - Get all interviews ✅
  - `getInterviewFeedback()` - Get feedback for interviews ✅
  - `updateApplicationStage()` - Update stage with notes ✅
- **Features**: ✅ ALL WORKING
  - **Header Section** ✅
    - Candidate full name ✅
    - Candidate ID (candidateNumber) ✅
    - Current stage badge with color coding ✅
    - Current status badge with color coding ✅
    - Stage change dropdown with modal ✅
    - Job title, department, and location ✅
    - Application date ✅
  - **Tabbed Interface** ✅
    - Personal Information tab ✅
    - CV/Resume tab ✅
    - Application History tab ✅
    - Interviews & Feedback tab ✅
    - Communication Log tab ✅
  - **Personal Information Tab** ✅
    - Full name, email, mobile phone ✅
    - National ID, date of birth, gender ✅
    - Address (city, street, country) ✅
    - Application date ✅
    - Notes/Cover letter display ✅
    - Assigned HR information ✅
  - **CV/Resume Viewer Tab** ✅
    - Download resume button ✅
    - Inline iframe viewer for PDF/documents ✅
    - Empty state handling ✅
  - **Application History Tab** ✅
    - Complete stage transition history ✅
    - Status change history ✅
    - Timestamp for each change ✅
    - Changed by (employee info) ✅
    - Notes attached to changes ✅
    - Color-coded stage/status badges ✅
  - **Interviews & Feedback Tab** ✅
    - Interview details (date, method, panel) ✅
    - Interview status badges ✅
    - Video link display ✅
    - Panel member names ✅
    - Individual feedback entries ✅
    - Aggregated average score ✅
    - Score color coding (green/yellow/red) ✅
    - Interviewer comments ✅
  - **Communication Log Tab** ✅
    - Placeholder for notification service integration ✅
  - **Stage Change Modal** ✅
    - Stage selection ✅
    - Optional notes field ✅
    - Confirmation/Cancel buttons ✅
    - Loading states ✅
    - Calls parent refresh callback (onStageUpdate) ✅
  - **Error Handling** ✅
    - Loading states ✅
    - Error messages with retry button ✅
    - Parallel data fetching with Promise.all ✅
- **Access**: HR Manager, HR Employee, Recruiter
- **Implementation Status**: ✅ **100% COMPLETE**
- **Integration**: Integrated into CandidatePipeline side panel ✅

#### NotificationCenter
- **Purpose**: Manage recruitment-related notifications
- **Backend APIs**:
  - Uses NotificationsService.emitForUser() throughout recruitment module
- **Service Methods**:
  - All recruitment methods emit notifications automatically:
    - Application stage/status updates
    - Interview scheduling/updates/cancellations
    - Offer approvals/acceptance/rejection
    - Onboarding task updates
- **Features**:
  - Real-time notification display (WebSocket/SSE integration)
  - Email notification templates (automated in service)
  - Notification preferences
  - Notification history
  - Mark as read/unread
  - Context data (applicationId, stage, jobTitle, etc.)
- **Access**: All authenticated users

#### CommunicationLog
- **Purpose**: Track all candidate communications (REC-022)
- **Backend APIs**:
  - Communication logging done via Logger throughout service
  - `sendOfferLetterForSignature()` logs communications (BR 37)
  - `recordSignature()` logs signature events (BR 37)
- **Service Methods**:
  - All methods log communications via Logger
  - Offer letter sending logs: recipient, timestamp, message type
  - Signature recording logs: signer, timestamp, action
- **Features**:
  - Email history display (from notifications)
  - Message thread view
  - Attachment viewer
  - Send new message (via notifications)
  - Communication templates (rejection, interview invite, etc.)
  - Audit trail for GDPR compliance
- **Access**: HR Manager, HR Employee

#### TalentPoolManager
- **Purpose**: Manage organization's talent pool (REC-007)
- **Backend APIs**:
  - Uses talent pool APIs from REC-007
- **Service Methods**:
  - `getTalentPool()` - Get all applications in talent pool (BR 12)
  - `searchTalentPool()` - Filter by job, stage, candidate name, dates
  - `getApplicationsByJobRequisition()` - Get with referral prioritization
  - `exportPersonalData()` - Export candidate data
- **Features**:
  - Candidate search and filter (by job, stage, name, dates)
  - Bulk import candidates
  - Tag and categorize candidates (referral tagging)
  - Export candidate data (GDPR compliance)
  - Add notes to profiles
  - Match candidates to open positions
  - Referral prioritization display
- **Access**: HR Manager, HR Employee, Recruiter

## Routing Structure

```
/recruitment
  /jobs
    /templates          -> JobTemplateManager
    /requisition        -> JobRequisitionManager (create/edit/list all in one)
    /list               -> Job list view (if separate view needed)
  /candidates
    /pipeline           -> CandidatePipeline
    /profile/:id        -> CandidateProfile
    /talent-pool        -> TalentPoolManager
  /interviews
    /schedule           -> InterviewScheduler
    /feedback/:id       -> InterviewFeedbackForm
    /panels             -> InterviewPanelCoordinator
  /offers
    /create/:candidateId -> OfferLetterGenerator
    /approvals          -> OfferApprovalWorkflow
    /preboarding/:id    -> PreboardingTaskManager
  /analytics
    /dashboard          -> RecruitmentDashboard
    /reports            -> RecruitmentReports
  /settings
    /hiring-process     -> HiringProcessTemplateManager
    /templates          -> RejectionTemplateManager
    /consent            -> ConsentManagement
/careers (public)
  /jobs                 -> PublicJobBoard
  /jobs/:id             -> JobDetailView
  /apply/:id            -> CandidateApplicationForm
  /application-status   -> CandidateStatusTracker
```

## State Management Requirements

- Job postings state
- Candidate pipeline state
- Interview schedules state
- Offer management state
- Notification state
- User preferences state
- Filter and search state

## Integration Points

- Calendar systems (Google Calendar, Outlook)
- Email service providers
- Electronic signature services
- Document storage (CV/resume uploads)
- Onboarding module (REC-029)
- Organizational Structure module (Jobs/Positions)
- Time Management module
- Notification system

## Business Rules Implemented

- BR 2: Job requisition requirements
- BR 6: Auto-posting to career sites
- BR 9: Stage tracking
- BR 10, BR 22: Comments and ratings
- BR 11: Status change notifications
- BR 12: Talent pool creation
- BR 14, BR 25: Referral prioritization
- BR 19: Interview scheduling
- BR 20, BR 21, BR 23: Assessment criteria
- BR 26: Offer management
- BR 27, BR 36, BR 37: Candidate communication
- BR 28, NFR-33: GDPR compliance
- BR 33: Recruitment analytics

## Non-Functional Requirements

- Real-time status updates (REC-017)
- GDPR compliance (REC-028)
- Responsive design for all components
- Accessibility standards (WCAG 2.1)
- Performance optimization for large candidate pools
- Secure file upload and storage
- Email deliverability
- Data encryption for sensitive information

---

## Backend API & Service Method Summary

### Complete Requirements Coverage

#### **REC-003: Job Description Templates**
- **Purpose**: Define standardized job description templates for consistent postings
- **Frontend Component**: JobTemplateManager
- **Backend APIs**:
  - `POST /recruitment/job-templates` - Create template
  - `GET /recruitment/job-templates` - Get all templates
  - `GET /recruitment/job-templates/:id` - Get single template
  - `PATCH /recruitment/job-templates/:id` - Update template
  - `DELETE /recruitment/job-templates/:id` - Delete template
- **Required Fields**: Title, department, qualifications, skills, description
- **Business Rules**: BR 2 (standardized job description templates)

#### **REC-004: Hiring Process Templates & Stage Tracking**
- **Purpose**: Establish hiring process templates to automatically update progress percentage
- **Frontend Component**: HiringProcessTemplateManager
- **Controller**: [recruitment.controller.ts:105-160](backend/src/recruitment/recruitment.controller.ts#L105-L160)
- **Service**: [recruitment.service.ts:141-494](backend/src/recruitment/recruitment.service.ts#L141-L494)
- **Key APIs**:
  - `PATCH /recruitment/applications/:id/stage` - Auto-calculates progress %
  - `GET /recruitment/applications/:id/progress` - Get progress & history
  - `GET /recruitment/applications/by-stage/:stage` - Filter by stage
  - `GET /recruitment/applications/:id/history` - Get stage history
- **Required Stages**: Screening, Shortlisting, Interview, Offer, Hired
- **Business Rules**: BR 9 (stage tracking with auto progress %), BR 11 (notifications to recruiters/hiring managers)

#### **REC-007: Talent Pool Management**
- **Service**: [recruitment.service.ts:566-781](backend/src/recruitment/recruitment.service.ts#L566-L781)
- **Key Methods**:
  - `submitApplication()` - With GDPR consent validation
  - `getTalentPool()` - All applications
  - `searchTalentPool()` - Advanced filtering
- **Business Rules**: BR 12 (talent pool with resume storage)

#### **REC-009: Recruitment Analytics**
- **Controller**: [recruitment.controller.ts:487-616](backend/src/recruitment/recruitment.controller.ts#L487-L616)
- **Service**: [recruitment.service.ts:1515-2069](backend/src/recruitment/recruitment.service.ts#L1515-L2069)
- **Key APIs**:
  - `GET /recruitment/analytics/kpis` - Complete dashboard
  - `GET /recruitment/analytics/time-to-hire` - Detailed metrics
  - `GET /recruitment/analytics/funnel` - Conversion rates
- **Business Rules**: BR 33 (recruitment metrics & KPIs)

#### **REC-010: Interview Scheduling**
- **Controller**: [recruitment.controller.ts:206-244](backend/src/recruitment/recruitment.controller.ts#L206-L244)
- **Service**: [recruitment.service.ts:961-1326](backend/src/recruitment/recruitment.service.ts#L961-L1326)
- **Key Features**:
  - Automatic leave/availability checking
  - Conflict detection for panel members
  - Auto calendar invites to panel (BR 19c)
  - Auto notifications to candidates (BR 19d)
- **Business Rules**: BR 19a, c, d (interview scheduling & notifications)

#### **REC-011: Interview Feedback**
- **Controller**: [recruitment.controller.ts:251-291](backend/src/recruitment/recruitment.controller.ts#L251-L291)
- **Service**: [recruitment.service.ts:1333-1503](backend/src/recruitment/recruitment.service.ts#L1333-L1503)
- **Key APIs**:
  - `POST /recruitment/interviews/:id/feedback`
  - `GET /recruitment/interviews/:id/aggregated-score`
- **Business Rules**: BR 10, BR 22 (comments and ratings at each stage)

#### **REC-014: Offer Management**
- **Controller**: [recruitment.controller.ts:317-411](backend/src/recruitment/recruitment.controller.ts#L317-L411)
- **Service**: [recruitment.service.ts:2366-2780](backend/src/recruitment/recruitment.service.ts#L2366-L2780)
- **Key Features**:
  - Multi-level approval workflow (BR 26b)
  - Automatic onboarding trigger on acceptance (BR 26c)
  - Status tracking through approval chain
- **Business Rules**: BR 26b, c (approval workflow & onboarding trigger)

#### **REC-017: Candidate Self-Service Portal**
- **Controller**: [recruitment.controller.ts:167-199](backend/src/recruitment/recruitment.controller.ts#L167-L199)
- **Service**: [recruitment.service.ts:842-953](backend/src/recruitment/recruitment.service.ts#L842-L953)
- **Key APIs**:
  - `GET /recruitment/candidate/:candidateId/applications` - With progress %
  - `GET /recruitment/candidate/:candidateId/applications/:applicationId` - Detailed status
- **Business Rules**: BR 27, BR 36 (candidate status tracking & automated alerts)

#### **REC-018: Electronic Signatures & Offer Letters**
- **Controller**: [recruitment.controller.ts:423-476](backend/src/recruitment/recruitment.controller.ts#L423-L476)
- **Service**: [recruitment.service.ts:2793-3240](backend/src/recruitment/recruitment.service.ts#L2793-L3240)
- **Key Features**:
  - PDF generation using PDFKit (BR 26a)
  - E-signature capture & storage (Signature Pad → PNG)
  - Communication logging (BR 37)
  - Multi-party signatures (candidate, HR, manager)
- **Business Rules**: BR 26a, d, BR 37 (offer letter generation & e-signatures)

#### **REC-023: Job Requisition Creation & Careers Page Publishing** ✅ FULLY IMPLEMENTED
- **Purpose**: Create job requisitions and publish them to the company careers page with employer-brand content
- **Frontend Component**: JobRequisitionManager ([page.tsx](frontend/src/app/recruitment/jobs/requisition/page.tsx))
- **Controller**: [recruitment.controller.ts:37-123](backend/src/recruitment/recruitment.controller.ts#L37-L123) (requisitions), [recruitment.controller.ts:59-74](backend/src/recruitment/recruitment.controller.ts#L59-L74) (careers)
- **Service**: [recruitment.service.ts:58-179](backend/src/recruitment/recruitment.service.ts#L58-L179) (requisitions), [recruitment.service.ts:501-556](backend/src/recruitment/recruitment.service.ts#L501-L556) (careers)
- **Key APIs**: ✅ ALL IMPLEMENTED
  - `POST /recruitment/job-requisitions` - Create new requisition ✅
  - `GET /recruitment/job-requisitions` - Get all requisitions ✅
  - `PATCH /recruitment/job-requisitions/:id` - Update requisition ✅
  - `PATCH /recruitment/job-requisitions/:id/status` - Update publish status (draft/published/closed) ✅
  - `DELETE /recruitment/job-requisitions/:id` - Delete requisition ✅ **NEWLY ADDED (2024-12-15)**
  - `GET /recruitment/careers/jobs` - Get published jobs (**PUBLIC** - no auth required) ✅
  - `GET /recruitment/job-requisitions/:id/preview` - Preview careers page format ✅
- **Required Fields**: Requisition ID, template (optional), location, openings, hiring manager, expiry date (optional)
- **Business Rules**: BR 2 (job details from template), BR 6 (auto-posting to career sites when status = published)
- **Implementation Notes**:
  - DELETE endpoint includes safety check: prevents deletion if applications exist
  - Frontend `apiCall()` helper properly handles empty DELETE responses (no JSON parsing errors)
  - All CRUD operations fully functional with proper error handling

#### **REC-028: GDPR Compliance**
- **Controller**: [recruitment.controller.ts:627-670](backend/src/recruitment/recruitment.controller.ts#L627-L670)
- **Service**: [recruitment.service.ts:2075-2355](backend/src/recruitment/recruitment.service.ts#L2075-L2355)
- **Key Features**:
  - Export all personal data (Article 15 - Right of Access)
  - Anonymize data (Article 17 - Right to Erasure/Be Forgotten)
  - Consent tracking with IP & timestamp
  - Data retention policy (default: 2 years)
- **Business Rules**: BR 28, NFR-33 (GDPR compliance)

#### **REC-029: Onboarding & Pre-boarding**
- **Controller**: [recruitment.controller.ts:681-724](backend/src/recruitment/recruitment.controller.ts#L681-L724)
- **Service**: [recruitment.service.ts:3255-3489](backend/src/recruitment/recruitment.service.ts#L3255-L3489)
- **Key Features**:
  - **Automatic trigger** on offer acceptance (BR 26c)
  - Contract record creation
  - Role-based task generation
  - Deadline auto-calculation
  - Progress tracking
- **Business Rules**: BR 26c (onboarding trigger on acceptance)

#### **REC-030: Referral Management**
- **Controller**: [recruitment.controller.ts:298-305](backend/src/recruitment/recruitment.controller.ts#L298-L305)
- **Service**: [recruitment.service.ts:791-835](backend/src/recruitment/recruitment.service.ts#L791-L835)
- **Key Features**:
  - Tag candidates as referrals
  - Automatic sorting (referrals first)
  - Priority display
- **Business Rules**: BR 14, BR 25 (referral prioritization & tie-breaking)

### Automated Notification System

All service methods automatically send notifications to relevant parties:
- **Candidates**: Application confirmations, stage updates, interview schedules, offer status
- **HR & Recruiters**: Status changes, feedback submissions, offer approvals
- **Hiring Managers**: Candidate progress updates
- **Panel Members**: Interview invites, reminders
- **Approvers**: Offer approval requests

**Implementation**: Uses `NotificationsService.emitForUser()` throughout with structured context data

### Key Technical Features

1. **Comprehensive Logging**: All communications logged via Logger (BR 37)
2. **Error Handling**: Try-catch blocks with graceful degradation
3. **Data Population**: MongoDB populate() for relational data
4. **Validation**: Panel membership, approver authorization, consent requirements
5. **Integration**: Leave management system (availability checking)
6. **File Management**: PDF generation, signature storage, resume uploads
7. **Security**: Role-based access control on all endpoints

### Access Control Summary

- **Public**: Careers page, job applications
- **Candidate**: Own applications, status tracking, notifications, offer responses
- **HR Employee/Recruiter**: Most recruitment operations
- **HR Manager**: Full access + admin functions (GDPR cleanup, etc.)
- **Department Head**: Offer approvals
- **Panel Members**: Submit feedback for assigned interviews
