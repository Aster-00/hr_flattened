import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

// Mock all the schema files to prevent Mongoose from trying to create them
jest.mock('./Models/job-requisition.schema', () => ({
  JobRequisition: { name: 'JobRequisition' },
  JobRequisitionSchema: {},
}));

jest.mock('./Models/application.schema', () => ({
  Application: { name: 'Application' },
  ApplicationSchema: {},
}));

jest.mock('./Models/interview.schema', () => ({
  Interview: { name: 'Interview' },
  InterviewSchema: {},
}));

jest.mock('./Models/assessment-result.schema', () => ({
  AssessmentResult: { name: 'AssessmentResult' },
  AssessmentResultSchema: {},
}));

jest.mock('./Models/offer.schema', () => ({
  Offer: { name: 'Offer' },
  OfferSchema: {},
}));

jest.mock('./Models/application-history.schema', () => ({
  ApplicationStatusHistory: { name: 'ApplicationStatusHistory' },
  ApplicationStatusHistorySchema: {},
}));

jest.mock('./Models/referral.schema', () => ({
  Referral: { name: 'Referral' },
  ReferralSchema: {},
}));

jest.mock('./Models/onboarding.schema', () => ({
  Onboarding: { name: 'Onboarding' },
  OnboardingSchema: {},
}));

import { RecruitmentService } from './recruitment.service';
import { NotificationsService } from '../leaves/notifications/notifications.service';
import { JobRequisition } from './Models/job-requisition.schema';
import { Application } from './Models/application.schema';
import { Interview } from './Models/interview.schema';
import { AssessmentResult } from './Models/assessment-result.schema';
import { Offer } from './Models/offer.schema';
import { ApplicationStatusHistory } from './Models/application-history.schema';
import { Referral } from './Models/referral.schema';
import { Onboarding } from './Models/onboarding.schema';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ApplicationStage } from './enums/application-stage.enum';

describe('RecruitmentService', () => {
  let service: RecruitmentService;
  let notificationService: NotificationsService;
  let jobRequisitionModel: Model<JobRequisition>;
  let applicationModel: Model<Application>;
  let applicationHistoryModel: Model<ApplicationStatusHistory>;
  let interviewModel: Model<Interview>;
  let assessmentResultModel: Model<AssessmentResult>;

  const mockJobRequisition = {
    _id: new Types.ObjectId(),
    requisitionId: 'REQ-2024-001',
    templateId: new Types.ObjectId(),
    departmentId: new Types.ObjectId(),
    location: 'Cairo, Egypt',
    openings: 3,
    hiringManagerId: new Types.ObjectId(),
    publishStatus: 'draft',
    expiryDate: new Date('2024-12-31'),
    save: jest.fn().mockResolvedValue(this),
    populate: jest.fn().mockResolvedValue(this),
  };

  // Mock the Mongoose Model as a constructor function
  const mockJobRequisitionModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    _id: new Types.ObjectId(),
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: new Types.ObjectId(),
      populate: jest.fn().mockResolvedValue({
        ...dto,
        _id: new Types.ObjectId(),
      }),
    }),
    populate: jest.fn().mockResolvedValue({
      ...dto,
      _id: new Types.ObjectId(),
    }),
  }));

  // Add static methods to the mock
  mockJobRequisitionModel.find = jest.fn();
  mockJobRequisitionModel.findById = jest.fn();
  mockJobRequisitionModel.create = jest.fn();
  mockJobRequisitionModel.exec = jest.fn();

  // Mock Application Model
  const mockApplicationModel: any = jest.fn().mockImplementation((dto) => {
    const mockDoc = {
      ...dto,
      _id: new Types.ObjectId(),
      populate: jest.fn().mockReturnThis(),
    };
    return {
      ...mockDoc,
      save: jest.fn().mockResolvedValue(mockDoc),
    };
  });

  mockApplicationModel.find = jest.fn();
  mockApplicationModel.findById = jest.fn();
  mockApplicationModel.findOne = jest.fn();
  mockApplicationModel.create = jest.fn();
  mockApplicationModel.exec = jest.fn();

  // Mock ApplicationStatusHistory Model
  const mockApplicationHistoryModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    _id: new Types.ObjectId(),
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: new Types.ObjectId(),
    }),
  }));

  mockApplicationHistoryModel.find = jest.fn();
  mockApplicationHistoryModel.findById = jest.fn();
  mockApplicationHistoryModel.create = jest.fn();
  mockApplicationHistoryModel.exec = jest.fn();

  // Mock Interview Model
  const mockInterviewModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    _id: new Types.ObjectId(),
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: new Types.ObjectId(),
    }),
  }));
  mockInterviewModel.find = jest.fn();
  mockInterviewModel.findById = jest.fn();
  mockInterviewModel.findOne = jest.fn();

  // Mock AssessmentResult Model
  const mockAssessmentResultModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    _id: new Types.ObjectId(),
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: new Types.ObjectId(),
    }),
  }));
  mockAssessmentResultModel.find = jest.fn();
  mockAssessmentResultModel.findById = jest.fn();
  mockAssessmentResultModel.findOne = jest.fn();

  // Mock Notification Service (from leaves module)
  const mockNotificationService = {
    emitForUser: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      receiverId: new Types.ObjectId(),
      title: 'Notification',
      message: 'Notification message',
    }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitmentService,
        {
          provide: getModelToken(JobRequisition.name),
          useValue: mockJobRequisitionModel,
        },
        {
          provide: getModelToken(Application.name),
          useValue: mockApplicationModel,
        },
        {
          provide: getModelToken(Interview.name),
          useValue: mockInterviewModel,
        },
        {
          provide: getModelToken(AssessmentResult.name),
          useValue: mockAssessmentResultModel,
        },
        {
          provide: getModelToken(Offer.name),
          useValue: {},
        },
        {
          provide: getModelToken(ApplicationStatusHistory.name),
          useValue: mockApplicationHistoryModel,
        },
        {
          provide: getModelToken(Referral.name),
          useValue: {},
        },
        {
          provide: getModelToken(Onboarding.name),
          useValue: {},
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<RecruitmentService>(RecruitmentService);
    notificationService = module.get<NotificationsService>(
      NotificationsService,
    );
    jobRequisitionModel = module.get<Model<JobRequisition>>(
      getModelToken(JobRequisition.name),
    );
    applicationModel = module.get<Model<Application>>(
      getModelToken(Application.name),
    );
    applicationHistoryModel = module.get<Model<ApplicationStatusHistory>>(
      getModelToken(ApplicationStatusHistory.name),
    );
    interviewModel = module.get<Model<Interview>>(
      getModelToken(Interview.name),
    );
    assessmentResultModel = module.get<Model<AssessmentResult>>(
      getModelToken(AssessmentResult.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJobRequisition', () => {
    it('should create a new job requisition successfully', async () => {
      const createJobRequisitionDto: CreateJobRequisitionDto = {
        requisitionId: 'REQ-2024-001',
        templateId: new Types.ObjectId(),
        location: 'Cairo, Egypt',
        openings: 3,
        hiringManagerId: new Types.ObjectId(),
        expiryDate: new Date('2024-12-31'),
      };

      const mockPopulatedResult = {
        _id: new Types.ObjectId(),
        requisitionId: 'REQ-2024-001',
        templateId: {
          title: 'Software Engineer',
          qualifications: ['Bachelor degree'],
          skills: ['JavaScript', 'TypeScript'],
        },
        departmentId: new Types.ObjectId(),
        location: 'Cairo, Egypt',
        openings: 3,
        hiringManagerId: new Types.ObjectId(),
        publishStatus: 'draft',
      };

      // Mock the implementation to return the populated result
      mockJobRequisitionModel.mockImplementationOnce((dto) => ({
        ...dto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue({
          ...dto,
          _id: new Types.ObjectId(),
          populate: jest.fn().mockResolvedValue(mockPopulatedResult),
        }),
      }));

      const result = await service.createJobRequisition(
        createJobRequisitionDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockPopulatedResult);
    });

    it('should set publishStatus to draft by default', async () => {
      const createJobRequisitionDto: CreateJobRequisitionDto = {
        requisitionId: 'REQ-2024-001',
        templateId: new Types.ObjectId(),
        location: 'Cairo, Egypt',
        openings: 3,
        hiringManagerId: new Types.ObjectId(),
        expiryDate: new Date('2024-12-31'),
      };

      // Mock the implementation to return a result with publishStatus
      mockJobRequisitionModel.mockImplementationOnce((dto) => ({
        ...dto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue({
          ...dto,
          _id: new Types.ObjectId(),
          populate: jest.fn().mockResolvedValue({
            ...dto,
            _id: new Types.ObjectId(),
            publishStatus: 'draft',
          }),
        }),
      }));

      const result = await service.createJobRequisition(createJobRequisitionDto);

      expect(result.publishStatus).toBe('draft');
    });
  });

  describe('getAllJobRequisitions', () => {
    it('should return all job requisitions with populated template', async () => {
      const mockRequisitions = [
        {
          ...mockJobRequisition,
          templateId: {
            title: 'Software Engineer',
            department: 'Engineering',
            qualifications: ['Bachelor degree'],
          },
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRequisitions),
      };

      jest.spyOn(jobRequisitionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAllJobRequisitions();

      expect(result).toEqual(mockRequisitions);
      expect(jobRequisitionModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith('templateId');
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    it('should return empty array if no requisitions found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(jobRequisitionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAllJobRequisitions();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getJobRequisitionById', () => {
    it('should return a job requisition by id with populated data', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        ...mockJobRequisition,
        _id: requisitionId,
        templateId: {
          title: 'Software Engineer',
          department: 'Engineering',
          qualifications: ['Bachelor degree'],
        },
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockQuery as any);

      const result = await service.getJobRequisitionById(requisitionId);

      expect(result).toEqual(mockRequisition);
      expect(jobRequisitionModel.findById).toHaveBeenCalledWith(requisitionId);
      expect(mockQuery.populate).toHaveBeenCalledWith('templateId');
    });

    it('should throw NotFoundException if requisition not found', async () => {
      const requisitionId = new Types.ObjectId().toString();

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockQuery as any);

      await expect(
        service.getJobRequisitionById(requisitionId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getJobRequisitionById(requisitionId),
      ).rejects.toThrow(`Job requisition with ID ${requisitionId} not found`);
    });
  });

  describe('updateJobRequisitionStatus', () => {
    it('should update requisition status to published', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        ...mockJobRequisition,
        publishStatus: 'draft',
        postingDate: null,
        save: jest.fn().mockResolvedValue({
          ...mockJobRequisition,
          publishStatus: 'published',
          postingDate: new Date(),
        }),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockResolvedValue(mockRequisition as any);

      await service.updateJobRequisitionStatus(
        requisitionId,
        'published',
      );

      expect(mockRequisition.publishStatus).toBe('published');
      expect(mockRequisition.save).toHaveBeenCalled();
    });

    it('should set postingDate when status changes to published', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        ...mockJobRequisition,
        publishStatus: 'draft',
        postingDate: null,
        save: jest.fn().mockResolvedValue({
          ...mockJobRequisition,
          publishStatus: 'published',
          postingDate: new Date(),
        }),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockResolvedValue(mockRequisition as any);

      await service.updateJobRequisitionStatus(requisitionId, 'published');

      expect(mockRequisition.postingDate).toBeDefined();
    });

    it('should not update postingDate if already set', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const existingPostingDate = new Date('2024-01-01');
      const mockRequisition = {
        ...mockJobRequisition,
        publishStatus: 'published',
        postingDate: existingPostingDate,
        save: jest.fn().mockResolvedValue(mockJobRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockResolvedValue(mockRequisition as any);

      await service.updateJobRequisitionStatus(requisitionId, 'published');

      expect(mockRequisition.postingDate).toBe(existingPostingDate);
    });

    it('should update status to closed', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        ...mockJobRequisition,
        publishStatus: 'published',
        save: jest.fn().mockResolvedValue({
          ...mockJobRequisition,
          publishStatus: 'closed',
        }),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockResolvedValue(mockRequisition as any);

      await service.updateJobRequisitionStatus(requisitionId, 'closed');

      expect(mockRequisition.publishStatus).toBe('closed');
      expect(mockRequisition.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if requisition not found', async () => {
      const requisitionId = new Types.ObjectId().toString();

      jest.spyOn(jobRequisitionModel, 'findById').mockResolvedValue(null);

      await expect(
        service.updateJobRequisitionStatus(requisitionId, 'published'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateJobRequisitionStatus(requisitionId, 'published'),
      ).rejects.toThrow(`Job requisition with ID ${requisitionId} not found`);
    });
  });

  describe('updateApplicationStage', () => {
    it('should update application stage and calculate progress percentage', async () => {
      const applicationId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId();
      const jobRequisitionId = new Types.ObjectId();

      const saveMock = jest.fn().mockResolvedValue({
        _id: applicationId,
        currentStage: ApplicationStage.HR_INTERVIEW,
      });

      const mockApplication = {
        _id: applicationId,
        currentStage: ApplicationStage.SCREENING,
        candidateId: { _id: candidateId },
        requisitionId: {
          _id: jobRequisitionId,
          templateId: { title: 'Software Engineer' }
        },
        save: saveMock,
      };

      const mockThirdPopulateQuery = {
        populate: jest.fn().mockResolvedValue(mockApplication),
      };

      const mockSecondPopulateQuery = {
        populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
      };

      const mockHistoryRecord = {
        _id: new Types.ObjectId(),
        applicationId: new Types.ObjectId(applicationId),
        stage: ApplicationStage.HR_INTERVIEW,
        changedAt: new Date(),
        notes: 'Stage updated to hr_interview',
        save: jest.fn().mockResolvedValue(this),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockQuery as any);

      mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue(mockHistoryRecord),
      }));

      const result = await service.updateApplicationStage(
        applicationId,
        ApplicationStage.HR_INTERVIEW,
        'Candidate performed well',
      );

      expect(result).toBeDefined();
      expect(result.application.currentStage).toBe(ApplicationStage.HR_INTERVIEW);
      expect(result.progress).toBe(75);
      expect(saveMock).toHaveBeenCalled();
      expect(notificationService.emitForUser).toHaveBeenCalled();
      expect(notificationService.emitForUser).toHaveBeenCalledWith(
        candidateId.toString(),
        'Application Status Update',
        expect.stringContaining('Software Engineer'),
        expect.objectContaining({ applicationId, stage: ApplicationStage.HR_INTERVIEW }),
      );
    });

    it('should throw NotFoundException if application not found', async () => {
      const applicationId = new Types.ObjectId().toString();

      const mockThirdPopulateQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };

      const mockSecondPopulateQuery = {
        populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
      };

      jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

      await expect(
        service.updateApplicationStage(applicationId, ApplicationStage.HR_INTERVIEW),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateApplicationStage(applicationId, ApplicationStage.HR_INTERVIEW),
      ).rejects.toThrow(`Application with ID ${applicationId} not found`);
    });

    it('should throw BadRequestException for invalid stage', async () => {
      const applicationId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId();
      const jobRequisitionId = new Types.ObjectId();

      const mockApplication = {
        _id: applicationId,
        currentStage: ApplicationStage.SCREENING,
        candidateId: { _id: candidateId },
        jobRequisitionId: {
          _id: jobRequisitionId,
          templateId: { title: 'Software Engineer' }
        },
        save: jest.fn(),
      };

      const mockThirdPopulateQuery = {
        populate: jest.fn().mockResolvedValue(mockApplication),
      };

      const mockSecondPopulateQuery = {
        populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockQuery as any);

      await expect(
        service.updateApplicationStage(applicationId, 'InvalidStage' as ApplicationStage),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateApplicationStage(applicationId, 'InvalidStage' as ApplicationStage),
      ).rejects.toThrow('Invalid stage: InvalidStage');
    });

    it('should calculate correct progress for each stage', async () => {
      const applicationId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId();
      const jobRequisitionId = new Types.ObjectId();
      const stages = [
        { stage: ApplicationStage.SCREENING, expectedProgress: 25 },
        { stage: ApplicationStage.DEPARTMENT_INTERVIEW, expectedProgress: 50 },
        { stage: ApplicationStage.HR_INTERVIEW, expectedProgress: 75 },
        { stage: ApplicationStage.OFFER, expectedProgress: 100 },
      ];

      for (const { stage, expectedProgress } of stages) {
        const mockApplication = {
          _id: applicationId,
          currentStage: ApplicationStage.SCREENING,
          candidateId: { _id: candidateId },
          requisitionId: {
            _id: jobRequisitionId,
            templateId: { title: 'Software Engineer' }
          },
          save: jest.fn().mockResolvedValue({
            _id: applicationId,
            currentStage: stage,
          }),
        };

        const mockThirdPopulateQuery = {
          populate: jest.fn().mockResolvedValue(mockApplication),
        };

        const mockSecondPopulateQuery = {
          populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
        };

        const mockQuery = {
          populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
        };

        jest
          .spyOn(applicationModel, 'findById')
          .mockReturnValue(mockQuery as any);

        mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
          ...dto,
          save: jest.fn().mockResolvedValue({}),
        }));

        const result = await service.updateApplicationStage(applicationId, stage);

        expect(result.progress).toBe(expectedProgress);
      }
    });
  });

  describe('getApplicationProgress', () => {
    it('should return application progress with stage history', async () => {
      const applicationId = new Types.ObjectId().toString();
      const mockApplication = {
        _id: applicationId,
        currentStage: ApplicationStage.HR_INTERVIEW,
      };

      const mockHistory = [
        {
          _id: new Types.ObjectId(),
          applicationId: new Types.ObjectId(applicationId),
          stage: ApplicationStage.SCREENING,
          changedAt: new Date('2024-01-01'),
          notes: 'Initial stage',
        },
        {
          _id: new Types.ObjectId(),
          applicationId: new Types.ObjectId(applicationId),
          stage: ApplicationStage.HR_INTERVIEW,
          changedAt: new Date('2024-01-15'),
          notes: 'Moved to HR interview',
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHistory),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockResolvedValue(mockApplication as any);

      jest
        .spyOn(applicationHistoryModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await service.getApplicationProgress(applicationId);

      expect(result).toBeDefined();
      expect(result.currentStage).toBe(ApplicationStage.HR_INTERVIEW);
      expect(result.progress).toBe(75);
      expect(result.stageHistory).toEqual(mockHistory);
      expect(applicationHistoryModel.find).toHaveBeenCalledWith({
        applicationId: new Types.ObjectId(applicationId),
      });
    });

    it('should throw NotFoundException if application not found', async () => {
      const applicationId = new Types.ObjectId().toString();

      jest.spyOn(applicationModel, 'findById').mockResolvedValue(null);

      await expect(
        service.getApplicationProgress(applicationId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getApplicationProgress(applicationId),
      ).rejects.toThrow(`Application with ID ${applicationId} not found`);
    });

    it('should calculate progress based on current stage', async () => {
      const applicationId = new Types.ObjectId().toString();
      const mockApplication = {
        _id: applicationId,
        currentStage: ApplicationStage.SCREENING,
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockResolvedValue(mockApplication as any);

      jest
        .spyOn(applicationHistoryModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await service.getApplicationProgress(applicationId);

      expect(result.progress).toBe(25);
      expect(result.currentStage).toBe(ApplicationStage.SCREENING);
    });
  });

  describe('getAllApplicationsWithProgress', () => {
    it('should return all applications with populated references', async () => {
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          currentStage: ApplicationStage.HR_INTERVIEW,
          jobRequisitionId: { requisitionId: 'REQ-001' },
          candidateId: { name: 'John Doe' },
        },
        {
          _id: new Types.ObjectId(),
          currentStage: ApplicationStage.OFFER,
          jobRequisitionId: { requisitionId: 'REQ-002' },
          candidateId: { name: 'Jane Smith' },
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAllApplicationsWithProgress();

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith('jobRequisitionId');
      expect(mockQuery.populate).toHaveBeenCalledWith('candidateId');
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    it('should return empty array if no applications found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAllApplicationsWithProgress();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getApplicationsByStage', () => {
    it('should return applications filtered by stage', async () => {
      const stage = ApplicationStage.HR_INTERVIEW;
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          currentStage: ApplicationStage.HR_INTERVIEW,
          jobRequisitionId: { requisitionId: 'REQ-001' },
          candidateId: { name: 'John Doe' },
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getApplicationsByStage(stage);

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalledWith({ currentStage: stage });
      expect(mockQuery.populate).toHaveBeenCalledWith('jobRequisitionId');
      expect(mockQuery.populate).toHaveBeenCalledWith('candidateId');
    });

    it('should throw BadRequestException for invalid stage', async () => {
      const invalidStage = 'InvalidStage' as ApplicationStage;

      await expect(
        service.getApplicationsByStage(invalidStage),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getApplicationsByStage(invalidStage),
      ).rejects.toThrow('Invalid stage: InvalidStage');
    });

    it('should return empty array if no applications in stage', async () => {
      const stage = ApplicationStage.OFFER;
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getApplicationsByStage(stage);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should accept all valid stages', async () => {
      const validStages = [
        ApplicationStage.SCREENING,
        ApplicationStage.DEPARTMENT_INTERVIEW,
        ApplicationStage.HR_INTERVIEW,
        ApplicationStage.OFFER,
      ];

      for (const stage of validStages) {
        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };

        jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

        await expect(service.getApplicationsByStage(stage)).resolves.toBeDefined();
      }
    });
  });

  describe('getApplicationHistory', () => {
    it('should return complete application stage history', async () => {
      const applicationId = new Types.ObjectId().toString();
      const mockApplication = {
        _id: applicationId,
        currentStage: ApplicationStage.OFFER,
      };

      const mockHistory = [
        {
          _id: new Types.ObjectId(),
          applicationId: new Types.ObjectId(applicationId),
          stage: ApplicationStage.SCREENING,
          changedAt: new Date('2024-01-01'),
          notes: 'Application received',
        },
        {
          _id: new Types.ObjectId(),
          applicationId: new Types.ObjectId(applicationId),
          stage: ApplicationStage.DEPARTMENT_INTERVIEW,
          changedAt: new Date('2024-01-05'),
          notes: 'Department interview scheduled',
        },
        {
          _id: new Types.ObjectId(),
          applicationId: new Types.ObjectId(applicationId),
          stage: ApplicationStage.HR_INTERVIEW,
          changedAt: new Date('2024-01-15'),
          notes: 'HR interview scheduled',
        },
        {
          _id: new Types.ObjectId(),
          applicationId: new Types.ObjectId(applicationId),
          stage: ApplicationStage.OFFER,
          changedAt: new Date('2024-01-20'),
          notes: 'Offer extended',
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHistory),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockResolvedValue(mockApplication as any);

      jest
        .spyOn(applicationHistoryModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await service.getApplicationHistory(applicationId);

      expect(result).toEqual(mockHistory);
      expect(result.length).toBe(4);
      expect(applicationHistoryModel.find).toHaveBeenCalledWith({
        applicationId: new Types.ObjectId(applicationId),
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ changedAt: 1 });
    });

    it('should throw NotFoundException if application not found', async () => {
      const applicationId = new Types.ObjectId().toString();

      jest.spyOn(applicationModel, 'findById').mockResolvedValue(null);

      await expect(
        service.getApplicationHistory(applicationId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getApplicationHistory(applicationId),
      ).rejects.toThrow(`Application with ID ${applicationId} not found`);
    });

    it('should return empty array if no history exists', async () => {
      const applicationId = new Types.ObjectId().toString();
      const mockApplication = {
        _id: applicationId,
        currentStage: ApplicationStage.SCREENING,
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockResolvedValue(mockApplication as any);

      jest
        .spyOn(applicationHistoryModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await service.getApplicationHistory(applicationId);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getPublishedJobRequisitions', () => {
    it('should return all published job requisitions sorted by posting date', async () => {
      const mockPublishedRequisitions = [
        {
          _id: new Types.ObjectId(),
          requisitionId: 'REQ-2024-001',
          publishStatus: 'published',
          postingDate: new Date('2024-02-01'),
          templateId: {
            title: 'Senior Software Engineer',
            department: 'Engineering',
            qualifications: ['Bachelor degree', '5+ years experience'],
            skills: ['JavaScript', 'TypeScript', 'React'],
          },
          location: 'Cairo, Egypt',
          openings: 2,
        },
        {
          _id: new Types.ObjectId(),
          requisitionId: 'REQ-2024-002',
          publishStatus: 'published',
          postingDate: new Date('2024-01-15'),
          templateId: {
            title: 'Product Manager',
            department: 'Product',
            qualifications: ['MBA preferred', '3+ years experience'],
            skills: ['Product Strategy', 'Agile', 'Data Analysis'],
          },
          location: 'Remote',
          openings: 1,
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPublishedRequisitions),
      };

      jest.spyOn(jobRequisitionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getPublishedJobRequisitions();

      expect(result).toEqual(mockPublishedRequisitions);
      expect(jobRequisitionModel.find).toHaveBeenCalledWith({ publishStatus: 'published' });
      expect(mockQuery.populate).toHaveBeenCalledWith('templateId');
      expect(mockQuery.sort).toHaveBeenCalledWith({ postingDate: -1 });
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    it('should return empty array if no published requisitions exist', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(jobRequisitionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getPublishedJobRequisitions();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should only return published requisitions, not draft or closed', async () => {
      const mockPublishedRequisitions = [
        {
          _id: new Types.ObjectId(),
          requisitionId: 'REQ-2024-001',
          publishStatus: 'published',
          postingDate: new Date('2024-02-01'),
          templateId: {
            title: 'Software Engineer',
            department: 'Engineering',
          },
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPublishedRequisitions),
      };

      jest.spyOn(jobRequisitionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getPublishedJobRequisitions();

      expect(jobRequisitionModel.find).toHaveBeenCalledWith({ publishStatus: 'published' });
      expect(result.every((req: any) => req.publishStatus === 'published')).toBe(true);
    });
  });

  describe('previewJobRequisitionForCareers', () => {
    it('should return formatted job requisition preview for careers page', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        _id: requisitionId,
        requisitionId: 'REQ-2024-001',
        templateId: {
          title: 'Senior Software Engineer',
          department: 'Engineering',
          qualifications: ['Bachelor degree in CS', '5+ years experience'],
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        },
        location: 'Cairo, Egypt',
        openings: 3,
        publishStatus: 'draft',
        postingDate: null,
        expiryDate: new Date('2024-12-31'),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockQuery as any);

      const result = await service.previewJobRequisitionForCareers(requisitionId);

      expect(result).toBeDefined();
      expect(result.requisition).toEqual(mockRequisition);
      expect(result.formattedForCareers).toBeDefined();
      expect(result.formattedForCareers.title).toBe('Senior Software Engineer');
      expect(result.formattedForCareers.department).toBe('Engineering');
      expect(result.formattedForCareers.location).toBe('Cairo, Egypt');
      expect(result.formattedForCareers.openings).toBe(3);
      expect(result.formattedForCareers.qualifications).toEqual([
        'Bachelor degree in CS',
        '5+ years experience',
      ]);
      expect(result.formattedForCareers.skills).toEqual([
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
      ]);
      expect(result.formattedForCareers.status).toBe('draft');
      expect(jobRequisitionModel.findById).toHaveBeenCalledWith(requisitionId);
      expect(mockQuery.populate).toHaveBeenCalledWith('templateId');
    });

    it('should throw NotFoundException if requisition not found', async () => {
      const requisitionId = new Types.ObjectId().toString();

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockQuery as any);

      await expect(
        service.previewJobRequisitionForCareers(requisitionId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.previewJobRequisitionForCareers(requisitionId),
      ).rejects.toThrow(`Job requisition with ID ${requisitionId} not found`);
    });

    it('should handle missing template or department data gracefully', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        _id: requisitionId,
        requisitionId: 'REQ-2024-001',
        templateId: null,
        departmentId: null,
        location: 'Cairo, Egypt',
        openings: 2,
        publishStatus: 'draft',
        postingDate: null,
        expiryDate: new Date('2024-12-31'),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockQuery as any);

      const result = await service.previewJobRequisitionForCareers(requisitionId);

      expect(result.formattedForCareers.title).toBe('Job Opening');
      expect(result.formattedForCareers.department).toBe('Department');
      expect(result.formattedForCareers.qualifications).toEqual([]);
      expect(result.formattedForCareers.skills).toEqual([]);
    });

    it('should include posting date for published requisitions', async () => {
      const requisitionId = new Types.ObjectId().toString();
      const postingDate = new Date('2024-01-15');
      const mockRequisition = {
        _id: requisitionId,
        requisitionId: 'REQ-2024-001',
        templateId: {
          title: 'Software Engineer',
          qualifications: ['Bachelor degree'],
          skills: ['JavaScript'],
        },
        departmentId: { name: 'Engineering' },
        location: 'Cairo, Egypt',
        openings: 1,
        publishStatus: 'published',
        postingDate: postingDate,
        expiryDate: new Date('2024-12-31'),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockQuery as any);

      const result = await service.previewJobRequisitionForCareers(requisitionId);

      expect(result.formattedForCareers.postingDate).toEqual(postingDate);
      expect(result.formattedForCareers.status).toBe('published');
    });
  });

  describe('submitApplication', () => {
    it('should submit an application with CV successfully', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId().toString();
      const resumeUrl = 'https://example.com/resumes/candidate-cv.pdf';
      const coverLetter = 'I am interested in this position';

      const mockRequisition = {
        _id: jobRequisitionId,
        publishStatus: 'published',
        templateId: { title: 'Software Engineer' },
      };

      const mockSavedApplication = {
        _id: new Types.ObjectId(),
        jobRequisitionId: new Types.ObjectId(jobRequisitionId),
        candidateId: new Types.ObjectId(candidateId),
        resumeUrl,
        coverLetter,
        currentStage: ApplicationStage.SCREENING,
        applicationDate: new Date(),
      };

      const mockPopulatedApplication = {
        ...mockSavedApplication,
        jobRequisitionId: { requisitionId: 'REQ-001' },
        candidateId: { name: 'John Doe' },
      };

      const mockRequisitionQuery = {
        populate: jest.fn().mockResolvedValue(mockRequisition),
      };

      const mockAppPopulateQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPopulatedApplication),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockRequisitionQuery as any);

      jest
        .spyOn(applicationModel, 'findOne')
        .mockResolvedValue(null);

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockAppPopulateQuery as any);

      mockApplicationModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue(mockSavedApplication),
      }));

      mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({}),
      }));

      const result = await service.submitApplication(
        jobRequisitionId,
        candidateId,
        resumeUrl,
        coverLetter,
      );

      expect(result).toBeDefined();
      expect(jobRequisitionModel.findById).toHaveBeenCalledWith(jobRequisitionId);
      expect(applicationModel.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job requisition not found', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId().toString();
      const resumeUrl = 'https://example.com/resumes/cv.pdf';

      const mockRequisitionQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockRequisitionQuery as any);

      await expect(
        service.submitApplication(jobRequisitionId, candidateId, resumeUrl),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.submitApplication(jobRequisitionId, candidateId, resumeUrl),
      ).rejects.toThrow(`Job requisition with ID ${jobRequisitionId} not found`);
    });

    it('should throw BadRequestException if job requisition is not published', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId().toString();
      const resumeUrl = 'https://example.com/resumes/cv.pdf';

      const mockRequisition = {
        _id: jobRequisitionId,
        publishStatus: 'draft',
      };

      const mockRequisitionQuery = {
        populate: jest.fn().mockResolvedValue(mockRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockRequisitionQuery as any);

      await expect(
        service.submitApplication(jobRequisitionId, candidateId, resumeUrl),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.submitApplication(jobRequisitionId, candidateId, resumeUrl),
      ).rejects.toThrow(`Job requisition ${jobRequisitionId} is not accepting applications`);
    });

    it('should throw BadRequestException if application already exists', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId().toString();
      const resumeUrl = 'https://example.com/resumes/cv.pdf';

      const mockRequisition = {
        _id: jobRequisitionId,
        publishStatus: 'published',
      };

      const mockExistingApplication = {
        _id: new Types.ObjectId(),
        jobRequisitionId,
        candidateId,
      };

      const mockRequisitionQuery = {
        populate: jest.fn().mockResolvedValue(mockRequisition),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockRequisitionQuery as any);

      jest
        .spyOn(applicationModel, 'findOne')
        .mockResolvedValue(mockExistingApplication as any);

      await expect(
        service.submitApplication(jobRequisitionId, candidateId, resumeUrl),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.submitApplication(jobRequisitionId, candidateId, resumeUrl),
      ).rejects.toThrow('Application already exists for this job and candidate');
    });

    it('should create application with default stage SCREENING', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId().toString();
      const resumeUrl = 'https://example.com/resumes/cv.pdf';

      const mockRequisition = {
        _id: jobRequisitionId,
        publishStatus: 'published',
        templateId: { title: 'Software Engineer' },
      };

      const mockSavedApplication = {
        _id: new Types.ObjectId(),
        jobRequisitionId: new Types.ObjectId(jobRequisitionId),
        candidateId: new Types.ObjectId(candidateId),
        resumeUrl,
        currentStage: ApplicationStage.SCREENING,
        applicationDate: new Date(),
      };

      const mockPopulatedApplication = {
        ...mockSavedApplication,
        jobRequisitionId: { requisitionId: 'REQ-001' },
        candidateId: { name: 'John Doe' },
      };

      const mockRequisitionQuery = {
        populate: jest.fn().mockResolvedValue(mockRequisition),
      };

      const mockAppPopulateQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPopulatedApplication),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockRequisitionQuery as any);

      jest
        .spyOn(applicationModel, 'findOne')
        .mockResolvedValue(null);

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockAppPopulateQuery as any);

      mockApplicationModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue(mockSavedApplication),
      }));

      mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({}),
      }));

      const result = await service.submitApplication(
        jobRequisitionId,
        candidateId,
        resumeUrl,
      );

      expect(result.currentStage).toBe(ApplicationStage.SCREENING);
    });

    it('should create application history record on submission', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const candidateId = new Types.ObjectId().toString();
      const resumeUrl = 'https://example.com/resumes/cv.pdf';

      const mockRequisition = {
        _id: jobRequisitionId,
        publishStatus: 'published',
        templateId: { title: 'Software Engineer' },
      };

      const mockSavedApplication = {
        _id: new Types.ObjectId(),
        jobRequisitionId: new Types.ObjectId(jobRequisitionId),
        candidateId: new Types.ObjectId(candidateId),
        resumeUrl,
        currentStage: ApplicationStage.SCREENING,
        applicationDate: new Date(),
      };

      const mockPopulatedApplication = {
        ...mockSavedApplication,
        jobRequisitionId: { requisitionId: 'REQ-001' },
        candidateId: { name: 'John Doe' },
      };

      const mockRequisitionQuery = {
        populate: jest.fn().mockResolvedValue(mockRequisition),
      };

      const mockAppPopulateQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPopulatedApplication),
      };

      const mockHistorySave = jest.fn().mockResolvedValue({});

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockReturnValue(mockRequisitionQuery as any);

      jest
        .spyOn(applicationModel, 'findOne')
        .mockResolvedValue(null);

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockAppPopulateQuery as any);

      mockApplicationModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue(mockSavedApplication),
      }));

      mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: mockHistorySave,
      }));

      await service.submitApplication(jobRequisitionId, candidateId, resumeUrl);

      expect(mockHistorySave).toHaveBeenCalled();
    });
  });

  describe('getTalentPool', () => {
    it('should return all applications in the talent pool', async () => {
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          currentStage: ApplicationStage.HR_INTERVIEW,
          resumeUrl: 'https://example.com/cv1.pdf',
          applicationDate: new Date('2024-02-01'),
          jobRequisitionId: { requisitionId: 'REQ-001' },
          candidateId: { name: 'John Doe' },
        },
        {
          _id: new Types.ObjectId(),
          currentStage: ApplicationStage.SCREENING,
          resumeUrl: 'https://example.com/cv2.pdf',
          applicationDate: new Date('2024-01-15'),
          jobRequisitionId: { requisitionId: 'REQ-002' },
          candidateId: { name: 'Jane Smith' },
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getTalentPool();

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith('jobRequisitionId');
      expect(mockQuery.populate).toHaveBeenCalledWith('candidateId');
      expect(mockQuery.sort).toHaveBeenCalledWith({ applicationDate: -1 });
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    it('should return empty array if no applications in talent pool', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getTalentPool();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('searchTalentPool', () => {
    it('should search talent pool by job requisition ID', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          jobRequisitionId: new Types.ObjectId(jobRequisitionId),
          currentStage: ApplicationStage.SCREENING,
          resumeUrl: 'https://example.com/cv.pdf',
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.searchTalentPool({ jobRequisitionId });

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalledWith({
        jobRequisitionId: new Types.ObjectId(jobRequisitionId),
      });
    });

    it('should search talent pool by application stage', async () => {
      const stage = ApplicationStage.HR_INTERVIEW;
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          currentStage: ApplicationStage.HR_INTERVIEW,
          resumeUrl: 'https://example.com/cv.pdf',
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.searchTalentPool({ currentStage: stage });

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalledWith({
        currentStage: stage,
      });
    });

    it('should throw BadRequestException for invalid stage', async () => {
      const invalidStage = 'InvalidStage' as ApplicationStage;

      await expect(
        service.searchTalentPool({ currentStage: invalidStage }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.searchTalentPool({ currentStage: invalidStage }),
      ).rejects.toThrow('Invalid stage: InvalidStage');
    });

    it('should search talent pool by date range', async () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-12-31');
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          applicationDate: new Date('2024-06-15'),
          resumeUrl: 'https://example.com/cv.pdf',
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.searchTalentPool({
        applicationDateFrom: dateFrom,
        applicationDateTo: dateTo,
      });

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalledWith({
        applicationDate: {
          $gte: dateFrom,
          $lte: dateTo,
        },
      });
    });

    it('should search talent pool by candidate name', async () => {
      const candidateName = 'John';
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          resumeUrl: 'https://example.com/cv1.pdf',
          candidateId: { name: 'John Doe' },
        },
        {
          _id: new Types.ObjectId(),
          resumeUrl: 'https://example.com/cv2.pdf',
          candidateId: { name: 'Jane Smith' },
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.searchTalentPool({ candidateName });

      expect(result.length).toBe(1);
      expect(result[0].candidateId).toEqual({ name: 'John Doe' });
    });

    it('should search talent pool with multiple filters', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const stage = ApplicationStage.SCREENING;
      const dateFrom = new Date('2024-01-01');

      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          jobRequisitionId: new Types.ObjectId(jobRequisitionId),
          currentStage: ApplicationStage.SCREENING,
          applicationDate: new Date('2024-02-01'),
          resumeUrl: 'https://example.com/cv.pdf',
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.searchTalentPool({
        jobRequisitionId,
        currentStage: stage,
        applicationDateFrom: dateFrom,
      });

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalledWith({
        jobRequisitionId: new Types.ObjectId(jobRequisitionId),
        currentStage: stage,
        applicationDate: {
          $gte: dateFrom,
        },
      });
    });

    it('should return empty array if no applications match filters', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.searchTalentPool({
        currentStage: ApplicationStage.OFFER,
      });

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getApplicationById', () => {
    it('should return application by ID with full details', async () => {
      const applicationId = new Types.ObjectId().toString();
      const mockApplication = {
        _id: applicationId,
        resumeUrl: 'https://example.com/cv.pdf',
        currentStage: ApplicationStage.HR_INTERVIEW,
        jobRequisitionId: { requisitionId: 'REQ-001' },
        candidateId: { name: 'John Doe' },
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplication),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockQuery as any);

      const result = await service.getApplicationById(applicationId);

      expect(result).toEqual(mockApplication);
      expect(applicationModel.findById).toHaveBeenCalledWith(applicationId);
      expect(mockQuery.populate).toHaveBeenCalledWith('jobRequisitionId');
      expect(mockQuery.populate).toHaveBeenCalledWith('candidateId');
    });

    it('should throw NotFoundException if application not found', async () => {
      const applicationId = new Types.ObjectId().toString();

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(applicationModel, 'findById')
        .mockReturnValue(mockQuery as any);

      await expect(
        service.getApplicationById(applicationId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getApplicationById(applicationId),
      ).rejects.toThrow(`Application with ID ${applicationId} not found`);
    });
  });

  describe('getApplicationsByCandidate', () => {
    it('should return all applications for a specific candidate', async () => {
      const candidateId = new Types.ObjectId().toString();
      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          candidateId: new Types.ObjectId(candidateId),
          resumeUrl: 'https://example.com/cv.pdf',
          jobRequisitionId: { requisitionId: 'REQ-001', title: 'Software Engineer' },
          applicationDate: new Date('2024-02-01'),
        },
        {
          _id: new Types.ObjectId(),
          candidateId: new Types.ObjectId(candidateId),
          resumeUrl: 'https://example.com/cv.pdf',
          jobRequisitionId: { requisitionId: 'REQ-002', title: 'Product Manager' },
          applicationDate: new Date('2024-01-15'),
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getApplicationsByCandidate(candidateId);

      expect(result).toEqual(mockApplications);
      expect(applicationModel.find).toHaveBeenCalledWith({
        candidateId: new Types.ObjectId(candidateId),
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('jobRequisitionId');
      expect(mockQuery.sort).toHaveBeenCalledWith({ applicationDate: -1 });
    });

    it('should return empty array if candidate has no applications', async () => {
      const candidateId = new Types.ObjectId().toString();

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getApplicationsByCandidate(candidateId);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getApplicationsByJobRequisition', () => {
    it('should return all applications for a specific job requisition', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        _id: jobRequisitionId,
        requisitionId: 'REQ-001',
      };

      const mockApplications = [
        {
          _id: new Types.ObjectId(),
          jobRequisitionId: new Types.ObjectId(jobRequisitionId),
          resumeUrl: 'https://example.com/cv1.pdf',
          candidateId: { name: 'John Doe' },
          applicationDate: new Date('2024-02-01'),
        },
        {
          _id: new Types.ObjectId(),
          jobRequisitionId: new Types.ObjectId(jobRequisitionId),
          resumeUrl: 'https://example.com/cv2.pdf',
          candidateId: { name: 'Jane Smith' },
          applicationDate: new Date('2024-01-15'),
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApplications),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockResolvedValue(mockRequisition as any);

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getApplicationsByJobRequisition(jobRequisitionId);

      expect(result).toEqual(mockApplications);
      expect(jobRequisitionModel.findById).toHaveBeenCalledWith(jobRequisitionId);
      expect(applicationModel.find).toHaveBeenCalledWith({
        jobRequisitionId: new Types.ObjectId(jobRequisitionId),
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('candidateId');
      expect(mockQuery.sort).toHaveBeenCalledWith({ applicationDate: -1 });
    });

    it('should throw NotFoundException if job requisition not found', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();

      jest.spyOn(jobRequisitionModel, 'findById').mockResolvedValue(null);

      await expect(
        service.getApplicationsByJobRequisition(jobRequisitionId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getApplicationsByJobRequisition(jobRequisitionId),
      ).rejects.toThrow(`Job requisition with ID ${jobRequisitionId} not found`);
    });

    it('should return empty array if job requisition has no applications', async () => {
      const jobRequisitionId = new Types.ObjectId().toString();
      const mockRequisition = {
        _id: jobRequisitionId,
        requisitionId: 'REQ-001',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(jobRequisitionModel, 'findById')
        .mockResolvedValue(mockRequisition as any);

      jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getApplicationsByJobRequisition(jobRequisitionId);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('REC-017: Candidate Status Tracking and Notifications', () => {
    describe('getCandidateApplicationsWithStatus', () => {
      it('should return candidate applications with status and progress', async () => {
        const candidateId = new Types.ObjectId().toString();
        const mockApplications = [
          {
            _id: new Types.ObjectId(),
            candidateId: new Types.ObjectId(candidateId),
            currentStage: ApplicationStage.HR_INTERVIEW,
            jobRequisitionId: { requisitionId: 'REQ-001', templateId: { title: 'Software Engineer' } },
            applicationDate: new Date('2024-02-01'),
          },
        ];

        const mockHistory = [
          {
            _id: new Types.ObjectId(),
            stage: ApplicationStage.SCREENING,
            changedAt: new Date('2024-01-01'),
          },
          {
            _id: new Types.ObjectId(),
            stage: ApplicationStage.HR_INTERVIEW,
            changedAt: new Date('2024-01-15'),
          },
        ];

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockApplications),
        };

        const mockHistoryQuery = {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockHistory),
        };

        jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);
        jest
          .spyOn(applicationHistoryModel, 'find')
          .mockReturnValue(mockHistoryQuery as any);

        const result = await service.getCandidateApplicationsWithStatus(candidateId);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].application).toEqual(mockApplications[0]);
        expect(result[0].progress).toBe(75);
        expect(result[0].currentStage).toBe(ApplicationStage.HR_INTERVIEW);
        expect(result[0].recentHistory).toEqual(mockHistory);
      });

      it('should return empty array if candidate has no applications', async () => {
        const candidateId = new Types.ObjectId().toString();

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };

        jest.spyOn(applicationModel, 'find').mockReturnValue(mockQuery as any);

        const result = await service.getCandidateApplicationsWithStatus(candidateId);

        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });
    });

    describe('getCandidateApplicationStatus', () => {
      it('should return detailed status for a specific application', async () => {
        const candidateId = new Types.ObjectId().toString();
        const applicationId = new Types.ObjectId().toString();
        const mockApplication = {
          _id: applicationId,
          candidateId: new Types.ObjectId(candidateId),
          currentStage: ApplicationStage.OFFER,
          jobRequisitionId: { requisitionId: 'REQ-001' },
        };

        const mockHistory = [
          {
            _id: new Types.ObjectId(),
            stage: ApplicationStage.SCREENING,
            changedAt: new Date('2024-01-01'),
          },
        ];

        const mockNotifications = [
          {
            _id: new Types.ObjectId(),
            to: candidateId,
            type: 'APPLICATION_STATUS_UPDATE',
            message: 'Your application status has been updated',
          },
        ];

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockApplication),
        };

        const mockHistoryQuery = {
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockHistory),
        };

        jest.spyOn(applicationModel, 'findOne').mockReturnValue(mockQuery as any);
        jest
          .spyOn(applicationHistoryModel, 'find')
          .mockReturnValue(mockHistoryQuery as any);
        jest
          .spyOn(notificationService, 'findAll')
          .mockResolvedValue(mockNotifications as any);

        const result = await service.getCandidateApplicationStatus(
          candidateId,
          applicationId,
        );

        expect(result).toBeDefined();
        expect(result.application).toEqual(mockApplication);
        expect(result.progress).toBe(100);
        expect(result.currentStage).toBe(ApplicationStage.OFFER);
        expect(result.stageHistory).toEqual(mockHistory);
        expect(result.notifications).toEqual(mockNotifications);
      });

      it('should throw NotFoundException if application not found for candidate', async () => {
        const candidateId = new Types.ObjectId().toString();
        const applicationId = new Types.ObjectId().toString();

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        };

        jest.spyOn(applicationModel, 'findOne').mockReturnValue(mockQuery as any);

        await expect(
          service.getCandidateApplicationStatus(candidateId, applicationId),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.getCandidateApplicationStatus(candidateId, applicationId),
        ).rejects.toThrow(
          `Application with ID ${applicationId} not found for candidate ${candidateId}`,
        );
      });
    });

    describe('getCandidateNotifications', () => {
      it('should return all notifications for a candidate', async () => {
        const candidateId = new Types.ObjectId().toString();
        const mockNotifications = [
          {
            _id: new Types.ObjectId(),
            to: candidateId,
            type: 'APPLICATION_SUBMITTED',
            message: 'Your application has been submitted',
          },
          {
            _id: new Types.ObjectId(),
            to: candidateId,
            type: 'APPLICATION_STATUS_UPDATE',
            message: 'Your application status has been updated',
          },
        ];

        jest
          .spyOn(notificationService, 'findAll')
          .mockResolvedValue(mockNotifications as any);

        const result = await service.getCandidateNotifications(candidateId);

        expect(result).toEqual(mockNotifications);
        expect(notificationService.findAll).toHaveBeenCalled();
      });
    });

    describe('submitApplication with notification', () => {
      it('should send notification when application is submitted', async () => {
        const jobRequisitionId = new Types.ObjectId().toString();
        const candidateId = new Types.ObjectId().toString();
        const resumeUrl = 'https://example.com/resumes/cv.pdf';

        const mockRequisition = {
          _id: jobRequisitionId,
          publishStatus: 'published',
          templateId: { title: 'Software Engineer' },
        };

        const mockSavedApplication = {
          _id: new Types.ObjectId(),
          jobRequisitionId: new Types.ObjectId(jobRequisitionId),
          candidateId: new Types.ObjectId(candidateId),
          resumeUrl,
          currentStage: ApplicationStage.SCREENING,
          applicationDate: new Date(),
        };

        const mockPopulatedApplication = {
          ...mockSavedApplication,
          jobRequisitionId: { requisitionId: 'REQ-001' },
          candidateId: { name: 'John Doe' },
        };

        const mockRequisitionQuery = {
          populate: jest.fn().mockResolvedValue(mockRequisition),
        };

        const mockAppPopulateQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockPopulatedApplication),
        };

        jest
          .spyOn(jobRequisitionModel, 'findById')
          .mockReturnValue(mockRequisitionQuery as any);

        jest.spyOn(applicationModel, 'findOne').mockResolvedValue(null);

        jest
          .spyOn(applicationModel, 'findById')
          .mockReturnValue(mockAppPopulateQuery as any);

        mockApplicationModel.mockImplementationOnce((dto) => ({
          ...dto,
          save: jest.fn().mockResolvedValue(mockSavedApplication),
        }));

        mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
          ...dto,
          save: jest.fn().mockResolvedValue({}),
        }));

        const result = await service.submitApplication(
          jobRequisitionId,
          candidateId,
          resumeUrl,
        );

        expect(result).toBeDefined();
        expect(notificationService.emitForUser).toHaveBeenCalled();
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          candidateId,
          'Application Submitted',
          expect.stringContaining('Software Engineer'),
          expect.objectContaining({ applicationId: mockSavedApplication._id.toString() }),
        );
      });
    });

    describe('REC-008: Candidate Tracking & Evaluation', () => {
      describe('updateApplicationStage - Stage Tracking with Notifications', () => {
        it('should send notifications to candidate, HR, and hiring manager on stage change', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();
          const hrId = new Types.ObjectId();
          const hiringManagerId = new Types.ObjectId();
          const jobRequisitionId = new Types.ObjectId();

          const mockApplication = {
            _id: applicationId,
            currentStage: ApplicationStage.SCREENING,
            candidateId: { _id: candidateId, name: 'John Doe' },
            assignedHr: { _id: hrId },
            requisitionId: {
              _id: jobRequisitionId,
              hiringManagerId: { _id: hiringManagerId },
              templateId: { title: 'Software Engineer' }
            },
            save: jest.fn().mockResolvedValue({
              _id: applicationId,
              currentStage: ApplicationStage.DEPARTMENT_INTERVIEW,
            }),
          };

          const mockThirdPopulateQuery = {
            populate: jest.fn().mockResolvedValue(mockApplication),
          };

          const mockSecondPopulateQuery = {
            populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
          };

          const mockQuery = {
            populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
          };

          jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

          mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({}),
          }));

          await service.updateApplicationStage(
            applicationId,
            ApplicationStage.DEPARTMENT_INTERVIEW,
            'Candidate passed screening',
          );

          // Verify candidate notification
          expect(notificationService.emitForUser).toHaveBeenCalledWith(
            candidateId.toString(),
            'Application Status Update',
            expect.stringContaining('Software Engineer'),
            expect.objectContaining({
              applicationId,
              stage: ApplicationStage.DEPARTMENT_INTERVIEW
            }),
          );

          // Verify HR notification
          expect(notificationService.emitForUser).toHaveBeenCalledWith(
            hrId.toString(),
            'Candidate Status Update',
            expect.stringContaining('John Doe'),
            expect.objectContaining({
              applicationId,
              stage: ApplicationStage.DEPARTMENT_INTERVIEW
            }),
          );

          // Verify hiring manager notification
          expect(notificationService.emitForUser).toHaveBeenCalledWith(
            hiringManagerId.toString(),
            'Candidate Progress Update',
            expect.stringContaining('John Doe'),
            expect.objectContaining({
              applicationId,
              stage: ApplicationStage.DEPARTMENT_INTERVIEW
            }),
          );

          // Should have been called 3 times total (candidate + HR + hiring manager)
          expect(notificationService.emitForUser).toHaveBeenCalledTimes(3);
        });

        it('should track application through all defined stages', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();
          const stages = [
            { stage: ApplicationStage.SCREENING, progress: 25 },
            { stage: ApplicationStage.DEPARTMENT_INTERVIEW, progress: 50 },
            { stage: ApplicationStage.HR_INTERVIEW, progress: 75 },
            { stage: ApplicationStage.OFFER, progress: 100 },
          ];

          for (const { stage, progress } of stages) {
            const mockApplication = {
              _id: applicationId,
              currentStage: ApplicationStage.SCREENING,
              candidateId: { _id: candidateId },
              requisitionId: {
                templateId: { title: 'Software Engineer' }
              },
              save: jest.fn().mockResolvedValue({
                _id: applicationId,
                currentStage: stage,
              }),
            };

            const mockThirdPopulateQuery = {
              populate: jest.fn().mockResolvedValue(mockApplication),
            };

            const mockSecondPopulateQuery = {
              populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
            };

            const mockQuery = {
              populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
            };

            jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

            mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
              ...dto,
              save: jest.fn().mockResolvedValue({}),
            }));

            const result = await service.updateApplicationStage(applicationId, stage);

            expect(result.progress).toBe(progress);
            expect(result.application.currentStage).toBe(stage);
          }
        });

        it('should create history record on each stage update', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();
          const changedBy = new Types.ObjectId().toString();

          const mockApplication = {
            _id: applicationId,
            currentStage: ApplicationStage.SCREENING,
            candidateId: { _id: candidateId },
            requisitionId: {
              templateId: { title: 'Software Engineer' }
            },
            save: jest.fn().mockResolvedValue({
              _id: applicationId,
              currentStage: ApplicationStage.HR_INTERVIEW,
            }),
          };

          const mockThirdPopulateQuery = {
            populate: jest.fn().mockResolvedValue(mockApplication),
          };

          const mockSecondPopulateQuery = {
            populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
          };

          const mockQuery = {
            populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
          };

          jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

          const historySaveMock = jest.fn().mockResolvedValue({});
          mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
            ...dto,
            save: historySaveMock,
          }));

          await service.updateApplicationStage(
            applicationId,
            ApplicationStage.HR_INTERVIEW,
            'Candidate performed well',
            changedBy,
          );

          expect(mockApplicationHistoryModel).toHaveBeenCalledWith(
            expect.objectContaining({
              applicationId: new Types.ObjectId(applicationId),
              oldStage: ApplicationStage.SCREENING,
              newStage: ApplicationStage.HR_INTERVIEW,
              notes: 'Candidate performed well',
            }),
          );
          expect(historySaveMock).toHaveBeenCalled();
        });
      });

      describe('updateApplicationStatus - Status Tracking with Notifications', () => {
        it('should send notifications on status change to HIRED', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();
          const hrId = new Types.ObjectId();
          const hiringManagerId = new Types.ObjectId();

          const mockApplication = {
            _id: applicationId,
            status: 'in_process',
            candidateId: { _id: candidateId, name: 'Jane Smith' },
            assignedHr: { _id: hrId },
            requisitionId: {
              hiringManagerId: { _id: hiringManagerId },
              templateId: { title: 'Product Manager' }
            },
            save: jest.fn().mockResolvedValue({
              _id: applicationId,
              status: 'hired',
            }),
          };

          const mockThirdPopulateQuery = {
            populate: jest.fn().mockResolvedValue(mockApplication),
          };

          const mockSecondPopulateQuery = {
            populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
          };

          const mockQuery = {
            populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
          };

          jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

          mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({}),
          }));

          await service.updateApplicationStatus(
            applicationId,
            'hired' as any,
            undefined,
            'Excellent candidate',
          );

          // Verify candidate notification contains congratulations
          expect(notificationService.emitForUser).toHaveBeenCalledWith(
            candidateId.toString(),
            expect.stringContaining('Accepted'),
            expect.stringContaining('Congratulations'),
            expect.anything(),
          );

          // Should notify all three stakeholders
          expect(notificationService.emitForUser).toHaveBeenCalledTimes(3);
        });

        it('should send notifications on status change to REJECTED with reason', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();
          const rejectionReason = 'Position filled by another candidate';

          const mockApplication = {
            _id: applicationId,
            status: 'in_process',
            candidateId: { _id: candidateId, name: 'John Doe' },
            requisitionId: {
              templateId: { title: 'Software Engineer' }
            },
            save: jest.fn().mockResolvedValue({
              _id: applicationId,
              status: 'rejected',
            }),
          };

          const mockThirdPopulateQuery = {
            populate: jest.fn().mockResolvedValue(mockApplication),
          };

          const mockSecondPopulateQuery = {
            populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
          };

          const mockQuery = {
            populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
          };

          jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

          mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({}),
          }));

          await service.updateApplicationStatus(
            applicationId,
            'rejected' as any,
            rejectionReason,
          );

          // Verify candidate notification contains rejection reason
          expect(notificationService.emitForUser).toHaveBeenCalledWith(
            candidateId.toString(),
            expect.stringContaining('Update'),
            expect.stringContaining(rejectionReason),
            expect.objectContaining({
              status: 'rejected',
              rejectionReason
            }),
          );
        });

        it('should create status history record with notes', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();
          const notes = 'Candidate declined offer';

          const mockApplication = {
            _id: applicationId,
            status: 'offer',
            candidateId: { _id: candidateId },
            requisitionId: {
              templateId: { title: 'Software Engineer' }
            },
            save: jest.fn().mockResolvedValue({
              _id: applicationId,
              status: 'rejected',
            }),
          };

          const mockThirdPopulateQuery = {
            populate: jest.fn().mockResolvedValue(mockApplication),
          };

          const mockSecondPopulateQuery = {
            populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
          };

          const mockQuery = {
            populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
          };

          jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

          const historySaveMock = jest.fn().mockResolvedValue({});
          mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
            ...dto,
            save: historySaveMock,
          }));

          await service.updateApplicationStatus(
            applicationId,
            'rejected' as any,
            undefined,
            notes,
          );

          expect(mockApplicationHistoryModel).toHaveBeenCalledWith(
            expect.objectContaining({
              applicationId: new Types.ObjectId(applicationId),
              oldStatus: 'offer',
              newStatus: 'rejected',
              notes,
            }),
          );
          expect(historySaveMock).toHaveBeenCalled();
        });
      });

      describe('getApplicationProgress - Progress Tracking', () => {
        it('should return progress and complete stage history for tracking', async () => {
          const applicationId = new Types.ObjectId().toString();
          const mockApplication = {
            _id: applicationId,
            currentStage: ApplicationStage.HR_INTERVIEW,
          };

          const mockHistory = [
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              oldStage: null,
              newStage: ApplicationStage.SCREENING,
              changedAt: new Date('2024-01-01'),
              notes: 'Application received',
            },
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              oldStage: ApplicationStage.SCREENING,
              newStage: ApplicationStage.DEPARTMENT_INTERVIEW,
              changedAt: new Date('2024-01-05'),
              notes: 'Passed initial screening',
            },
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              oldStage: ApplicationStage.DEPARTMENT_INTERVIEW,
              newStage: ApplicationStage.HR_INTERVIEW,
              changedAt: new Date('2024-01-10'),
              notes: 'Passed department interview',
            },
          ];

          const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockHistory),
          };

          jest.spyOn(applicationModel, 'findById').mockResolvedValue(mockApplication as any);
          jest.spyOn(applicationHistoryModel, 'find').mockReturnValue(mockQuery as any);

          const result = await service.getApplicationProgress(applicationId);

          expect(result.currentStage).toBe(ApplicationStage.HR_INTERVIEW);
          expect(result.progress).toBe(75); // HR Interview is stage 3 of 4
          expect(result.stageHistory).toHaveLength(3);
          expect(result.stageHistory[0].notes).toBe('Application received');
          expect(result.stageHistory[2].newStage).toBe(ApplicationStage.HR_INTERVIEW);
        });

        it('should show correct progress percentage for each stage', async () => {
          const applicationId = new Types.ObjectId().toString();
          const stageProgressMap = [
            { stage: ApplicationStage.SCREENING, expectedProgress: 25 },
            { stage: ApplicationStage.DEPARTMENT_INTERVIEW, expectedProgress: 50 },
            { stage: ApplicationStage.HR_INTERVIEW, expectedProgress: 75 },
            { stage: ApplicationStage.OFFER, expectedProgress: 100 },
          ];

          for (const { stage, expectedProgress } of stageProgressMap) {
            const mockApplication = {
              _id: applicationId,
              currentStage: stage,
            };

            const mockQuery = {
              sort: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([]),
            };

            jest.spyOn(applicationModel, 'findById').mockResolvedValue(mockApplication as any);
            jest.spyOn(applicationHistoryModel, 'find').mockReturnValue(mockQuery as any);

            const result = await service.getApplicationProgress(applicationId);

            expect(result.progress).toBe(expectedProgress);
            expect(result.currentStage).toBe(stage);
          }
        });
      });

      describe('getApplicationHistory - Audit Trail', () => {
        it('should return chronological history of all stage transitions', async () => {
          const applicationId = new Types.ObjectId().toString();
          const mockApplication = {
            _id: applicationId,
            currentStage: ApplicationStage.OFFER,
          };

          const mockHistory = [
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              newStage: ApplicationStage.SCREENING,
              changedAt: new Date('2024-01-01'),
              notes: 'Application submitted',
            },
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              oldStage: ApplicationStage.SCREENING,
              newStage: ApplicationStage.DEPARTMENT_INTERVIEW,
              changedAt: new Date('2024-01-05'),
              notes: 'Moved to department interview',
            },
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              oldStage: ApplicationStage.DEPARTMENT_INTERVIEW,
              newStage: ApplicationStage.HR_INTERVIEW,
              changedAt: new Date('2024-01-10'),
              notes: 'Moved to HR interview',
            },
            {
              _id: new Types.ObjectId(),
              applicationId: new Types.ObjectId(applicationId),
              oldStage: ApplicationStage.HR_INTERVIEW,
              newStage: ApplicationStage.OFFER,
              changedAt: new Date('2024-01-15'),
              notes: 'Offer extended',
            },
          ];

          const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockHistory),
          };

          jest.spyOn(applicationModel, 'findById').mockResolvedValue(mockApplication as any);
          jest.spyOn(applicationHistoryModel, 'find').mockReturnValue(mockQuery as any);

          const result = await service.getApplicationHistory(applicationId);

          expect(result).toHaveLength(4);
          expect(result[0].newStage).toBe(ApplicationStage.SCREENING);
          expect(result[3].newStage).toBe(ApplicationStage.OFFER);
          expect(mockQuery.sort).toHaveBeenCalledWith({ changedAt: 1 }); // Ascending order
        });
      });

      describe('Notification Failure Handling', () => {
        it('should not fail stage update if notification sending fails', async () => {
          const applicationId = new Types.ObjectId().toString();
          const candidateId = new Types.ObjectId();

          const mockApplication = {
            _id: applicationId,
            currentStage: ApplicationStage.SCREENING,
            candidateId: { _id: candidateId },
            requisitionId: {
              templateId: { title: 'Software Engineer' }
            },
            save: jest.fn().mockResolvedValue({
              _id: applicationId,
              currentStage: ApplicationStage.DEPARTMENT_INTERVIEW,
            }),
          };

          const mockThirdPopulateQuery = {
            populate: jest.fn().mockResolvedValue(mockApplication),
          };

          const mockSecondPopulateQuery = {
            populate: jest.fn().mockReturnValue(mockThirdPopulateQuery),
          };

          const mockQuery = {
            populate: jest.fn().mockReturnValue(mockSecondPopulateQuery),
          };

          jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

          mockApplicationHistoryModel.mockImplementationOnce((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({}),
          }));

          // Make notification service fail
          jest.spyOn(notificationService, 'emitForUser').mockRejectedValueOnce(
            new Error('Notification service unavailable')
          );

          // Should still succeed despite notification failure
          const result = await service.updateApplicationStage(
            applicationId,
            ApplicationStage.DEPARTMENT_INTERVIEW,
          );

          expect(result).toBeDefined();
          expect(result.application.currentStage).toBe(ApplicationStage.DEPARTMENT_INTERVIEW);
          expect(result.progress).toBe(50);
        });
      });
    });
  });

  /**
   * REC-010: Interview Scheduling & Management Tests
   */
  describe('REC-010: Interview Scheduling', () => {
    let interviewModel: any;

    beforeEach(() => {
      // Create mock interview model
      interviewModel = jest.fn().mockImplementation((dto) => ({
        ...dto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue({
          ...dto,
          _id: new Types.ObjectId(),
        }),
      }));

      interviewModel.find = jest.fn();
      interviewModel.findById = jest.fn();
      interviewModel.create = jest.fn();

      // Replace the interview model in the service
      (service as any).interviewModel = interviewModel;
    });

    describe('scheduleInterview', () => {
      it('should schedule an interview and notify panel members and candidate', async () => {
        const applicationId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const panelMember1 = new Types.ObjectId();
        const panelMember2 = new Types.ObjectId();
        const scheduledDate = new Date('2024-12-15T10:00:00');

        const mockApplication = {
          _id: applicationId,
          currentStage: 'department_interview',
          candidateId: { _id: candidateId, name: 'John Doe' },
          requisitionId: {
            _id: new Types.ObjectId(),
            templateId: { title: 'Software Engineer' },
          },
        };

        const mockSavedInterview = {
          _id: new Types.ObjectId(),
          applicationId,
          stage: 'department_interview',
          scheduledDate,
          method: 'video',
          panel: [panelMember1, panelMember2],
          videoLink: 'https://meet.example.com/interview-123',
          status: 'scheduled',
        };

        const mockPopulatedInterview = {
          ...mockSavedInterview,
          applicationId: mockApplication,
          panel: [
            { _id: panelMember1, name: 'Interviewer 1' },
            { _id: panelMember2, name: 'Interviewer 2' },
          ],
        };

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockApplication),
        };

        jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

        interviewModel.mockImplementationOnce((dto) => ({
          ...dto,
          _id: mockSavedInterview._id,
          save: jest.fn().mockResolvedValue(mockSavedInterview),
        }));

        const mockPopulateQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockPopulatedInterview),
        };

        jest.spyOn(interviewModel, 'findById').mockReturnValue(mockPopulateQuery as any);

        const scheduleDto = {
          applicationId,
          stage: 'department_interview' as any,
          scheduledDate,
          method: 'video' as any,
          panel: [panelMember1, panelMember2],
          videoLink: 'https://meet.example.com/interview-123',
        };

        const result = await service.scheduleInterview(scheduleDto);

        expect(result).toBeDefined();
        expect(result._id).toEqual(mockSavedInterview._id);

        // Verify panel members were notified (2 panel members)
        expect(notificationService.emitForUser).toHaveBeenCalledTimes(3); // 2 panel + 1 candidate

        // Verify panel member notifications
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          panelMember1.toString(),
          'Interview Scheduled - Calendar Invite',
          expect.stringContaining('John Doe'),
          expect.objectContaining({ interviewId: mockSavedInterview._id.toString() }),
        );

        // Verify candidate notification
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          candidateId.toString(),
          'Interview Scheduled',
          expect.stringContaining('Software Engineer'),
          expect.objectContaining({ interviewId: mockSavedInterview._id.toString() }),
        );
      });

      it('should throw NotFoundException if application not found', async () => {
        const applicationId = new Types.ObjectId();
        const scheduledDate = new Date('2024-12-15T10:00:00');

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        };

        jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

        const scheduleDto = {
          applicationId,
          stage: 'department_interview' as any,
          scheduledDate,
          method: 'video' as any,
          panel: [new Types.ObjectId()],
        };

        await expect(service.scheduleInterview(scheduleDto)).rejects.toThrow(NotFoundException);
        await expect(service.scheduleInterview(scheduleDto)).rejects.toThrow(
          `Application with ID ${applicationId} not found`,
        );
      });

      it('should handle different interview methods correctly', async () => {
        const applicationId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const panelMember = new Types.ObjectId();
        const scheduledDate = new Date('2024-12-15T10:00:00');

        const mockApplication = {
          _id: applicationId,
          candidateId: { _id: candidateId, name: 'Jane Smith' },
          requisitionId: {
            _id: new Types.ObjectId(),
            templateId: { title: 'Product Manager' },
          },
        };

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockApplication),
        };

        jest.spyOn(applicationModel, 'findById').mockReturnValue(mockQuery as any);

        const mockSavedInterview = {
          _id: new Types.ObjectId(),
          applicationId,
          method: 'phone',
          save: jest.fn(),
        };

        interviewModel.mockImplementationOnce((dto) => ({
          ...dto,
          save: jest.fn().mockResolvedValue(mockSavedInterview),
        }));

        const mockPopulateQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockSavedInterview),
        };

        jest.spyOn(interviewModel, 'findById').mockReturnValue(mockPopulateQuery as any);

        const scheduleDto = {
          applicationId,
          stage: 'hr_interview' as any,
          scheduledDate,
          method: 'phone' as any,
          panel: [panelMember],
        };

        await service.scheduleInterview(scheduleDto);

        // Verify phone interview notification
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          panelMember.toString(),
          'Interview Scheduled - Calendar Invite',
          expect.stringContaining('phone call'),
          expect.any(Object),
        );
      });
    });

    describe('getInterviewsByApplication', () => {
      it('should return all interviews for an application', async () => {
        const applicationId = new Types.ObjectId();

        const mockApplication = {
          _id: applicationId,
          currentStage: 'department_interview',
        };

        const mockInterviews = [
          {
            _id: new Types.ObjectId(),
            applicationId,
            stage: 'department_interview',
            scheduledDate: new Date('2024-12-15'),
            status: 'scheduled',
          },
          {
            _id: new Types.ObjectId(),
            applicationId,
            stage: 'hr_interview',
            scheduledDate: new Date('2024-12-20'),
            status: 'scheduled',
          },
        ];

        jest.spyOn(applicationModel, 'findById').mockResolvedValue(mockApplication as any);

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockInterviews),
        };

        jest.spyOn(interviewModel, 'find').mockReturnValue(mockQuery as any);

        const result = await service.getInterviewsByApplication(applicationId.toString());

        expect(result).toEqual(mockInterviews);
        expect(result.length).toBe(2);
        expect(interviewModel.find).toHaveBeenCalledWith({
          applicationId: new Types.ObjectId(applicationId.toString()),
        });
      });

      it('should throw NotFoundException if application not found', async () => {
        const applicationId = new Types.ObjectId();

        jest.spyOn(applicationModel, 'findById').mockResolvedValue(null);

        await expect(
          service.getInterviewsByApplication(applicationId.toString()),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('updateInterview', () => {
      it('should update interview and re-notify if schedule changes', async () => {
        const interviewId = new Types.ObjectId();
        const applicationId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const panelMember = new Types.ObjectId();
        const oldDate = new Date('2024-12-15T10:00:00');
        const newDate = new Date('2024-12-16T14:00:00');

        const mockInterview = {
          _id: interviewId,
          applicationId: {
            _id: applicationId,
            candidateId: { _id: candidateId, name: 'John Doe' },
            requisitionId: {
              templateId: { title: 'Software Engineer' },
            },
          },
          scheduledDate: oldDate,
          method: 'video',
          panel: [panelMember],
          save: jest.fn().mockResolvedValue({
            _id: interviewId,
            scheduledDate: newDate,
          }),
        };

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockInterview),
        };

        jest.spyOn(interviewModel, 'findById').mockReturnValue(mockQuery as any);

        const updateData = {
          scheduledDate: newDate,
        };

        await service.updateInterview(interviewId.toString(), updateData);

        expect(mockInterview.save).toHaveBeenCalled();

        // Verify re-notifications were sent
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          panelMember.toString(),
          'Interview Rescheduled',
          expect.stringContaining('rescheduled'),
          expect.any(Object),
        );

        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          candidateId.toString(),
          'Interview Rescheduled',
          expect.stringContaining('rescheduled'),
          expect.any(Object),
        );
      });

      it('should throw NotFoundException if interview not found', async () => {
        const interviewId = new Types.ObjectId();

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        };

        jest.spyOn(interviewModel, 'findById').mockReturnValue(mockQuery as any);

        await expect(
          service.updateInterview(interviewId.toString(), {}),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('cancelInterview', () => {
      it('should cancel interview and notify all participants', async () => {
        const interviewId = new Types.ObjectId();
        const applicationId = new Types.ObjectId();
        const candidateId = new Types.ObjectId();
        const panelMember1 = new Types.ObjectId();
        const panelMember2 = new Types.ObjectId();
        const scheduledDate = new Date('2024-12-15T10:00:00');

        const mockInterview = {
          _id: interviewId,
          applicationId: {
            _id: applicationId,
            candidateId: { _id: candidateId, name: 'Jane Smith' },
            requisitionId: {
              templateId: { title: 'Product Manager' },
            },
          },
          scheduledDate,
          panel: [panelMember1, panelMember2],
          status: 'scheduled',
          save: jest.fn().mockResolvedValue({
            _id: interviewId,
            status: 'cancelled',
          }),
        };

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockInterview),
        };

        jest.spyOn(interviewModel, 'findById').mockReturnValue(mockQuery as any);

        const result = await service.cancelInterview(interviewId.toString());

        expect(result.status).toBe('cancelled');
        expect(mockInterview.save).toHaveBeenCalled();

        // Verify cancellation notifications (2 panel members + 1 candidate)
        expect(notificationService.emitForUser).toHaveBeenCalledTimes(3);

        // Verify panel member notifications
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          panelMember1.toString(),
          'Interview Cancelled',
          expect.stringContaining('cancelled'),
          expect.any(Object),
        );

        // Verify candidate notification
        expect(notificationService.emitForUser).toHaveBeenCalledWith(
          candidateId.toString(),
          'Interview Cancelled',
          expect.stringContaining('regret to inform'),
          expect.any(Object),
        );
      });

      it('should throw NotFoundException if interview not found', async () => {
        const interviewId = new Types.ObjectId();

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        };

        jest.spyOn(interviewModel, 'findById').mockReturnValue(mockQuery as any);

        await expect(
          service.cancelInterview(interviewId.toString()),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.cancelInterview(interviewId.toString()),
        ).rejects.toThrow(`Interview with ID ${interviewId} not found`);
      });
    });
  });

  describe('submitInterviewFeedback', () => {
    it('should submit feedback successfully', async () => {
      const interviewId = new Types.ObjectId();
      const interviewerId = new Types.ObjectId();
      const applicationId = new Types.ObjectId();

      const mockInterview = {
        _id: interviewId,
        panel: [interviewerId],
        applicationId,
      };

      const mockApplication = {
        _id: applicationId,
        assignedHr: new Types.ObjectId(),
        candidateId: { name: 'Candidate' },
        requisitionId: { templateId: { title: 'Job' } },
      };

      jest.spyOn(interviewModel, 'findById').mockResolvedValue(mockInterview as any);
      jest.spyOn(assessmentResultModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(applicationModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockApplication),
          }),
        }),
      } as any);

      const dto = {
        interviewId: interviewId.toString(),
        interviewerId: interviewerId.toString(),
        score: 85,
        comments: 'Good',
      };

      const result = await service.submitInterviewFeedback(dto);

      expect(result).toBeDefined();
      expect(assessmentResultModel).toHaveBeenCalled();
      expect(notificationService.emitForUser).toHaveBeenCalled();
    });

    it('should throw error if interviewer not in panel', async () => {
      const interviewId = new Types.ObjectId();
      const interviewerId = new Types.ObjectId();
      const otherId = new Types.ObjectId();

      const mockInterview = {
        _id: interviewId,
        panel: [otherId],
      };

      jest.spyOn(interviewModel, 'findById').mockResolvedValue(mockInterview as any);

      const dto = {
        interviewId: interviewId.toString(),
        interviewerId: interviewerId.toString(),
        score: 85,
      };

      await expect(service.submitInterviewFeedback(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAggregatedInterviewScore', () => {
    it('should calculate average score correctly', async () => {
      const interviewId = new Types.ObjectId();
      const mockInterview = {
        _id: interviewId,
        panel: [new Types.ObjectId(), new Types.ObjectId()],
      };

      const mockResults = [
        { score: 80 },
        { score: 90 },
      ];

      jest.spyOn(interviewModel, 'findById').mockResolvedValue(mockInterview as any);
      jest.spyOn(assessmentResultModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockResults),
        }),
      } as any);

      const result = await service.getAggregatedInterviewScore(interviewId.toString());

      expect(result.averageScore).toBe(85);
      expect(result.totalFeedbacks).toBe(2);
      expect(result.panelSize).toBe(2);
    });
  });
});
