import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeProfileService } from './employee-profile.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmployeeProfile } from './Models/employee-profile.schema';
import { Counter } from './Models/counter.schema';
import { EmployeeProfileChangeRequest } from './Models/ep-change-request.schema';
import { EmployeeSystemRole } from './Models/employee-system-role.schema';
import { Candidate } from './Models/candidate.schema';
import { Department } from 'src/organization-structure/Models/department.schema';

describe('EmployeeProfileService', () => {
  let service: EmployeeProfileService;
  let empRoleModel: any;

  beforeEach(async () => {
    empRoleModel = {
      distinct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeProfileService,
        {
          provide: getModelToken(EmployeeProfile.name),
          useValue: {},
        },
        {
          provide: getModelToken(Counter.name),
          useValue: {},
        },
        {
          provide: getModelToken(EmployeeProfileChangeRequest.name),
          useValue: {},
        },
        {
          provide: getModelToken(EmployeeSystemRole.name),
          useValue: empRoleModel,
        },
        {
          provide: getModelToken(Candidate.name),
          useValue: {},
        },
        {
          provide: getModelToken(Department.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EmployeeProfileService>(EmployeeProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getUniquePermissions should call distinct on empRoleModel', async () => {
    const mockPermissions = ['PERM1', 'PERM2'];
    empRoleModel.distinct.mockResolvedValue(mockPermissions);

    const result = await service.getUniquePermissions();

    expect(empRoleModel.distinct).toHaveBeenCalledWith('permissions');
    expect(result).toEqual(mockPermissions);
  });
});
