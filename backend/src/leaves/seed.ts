import mongoose from 'mongoose';
import { LeaveTypeSchema } from './Models/leave-type.schema';
import { LeavePolicySchema } from './Models/leave-policy.schema';
import { LeaveEntitlementSchema } from './Models/leave-entitlement.schema';
import { CalendarSchema } from './Models/calendar.schema';
import { AttachmentType } from './enums/attachment-type.enum';
import { RoundingRule } from './enums/rounding-rule.enum';

export async function seedLeaveManagement(
  connection: mongoose.Connection,
  employees: any[],
  departments: any[],
) {
  const LeaveTypeModel = connection.model('LeaveType', LeaveTypeSchema);
  const LeavePolicyModel = connection.model('LeavePolicy', LeavePolicySchema);
  const LeaveEntitlementModel = connection.model('LeaveEntitlement', LeaveEntitlementSchema);
  const CalendarModel = connection.model('Calendar', CalendarSchema);

  console.log('Clearing Leave Management data...');
  await LeaveTypeModel.deleteMany({});
  await LeavePolicyModel.deleteMany({});
  await LeaveEntitlementModel.deleteMany({});
  await CalendarModel.deleteMany({});

  console.log('Seeding Leave Types...');
  
  // Annual Leave
  const annualLeave = await LeaveTypeModel.create({
    name: 'Annual Leave',
    code: 'AL',
    description: 'Paid annual vacation leave',
    paidLeave: true,
    requiresApproval: true,
    accrualBased: true,
    carryForwardAllowed: true,
    maxCarryForward: 5,
    requiresAttachment: false,
    color: '#10b981', // Green
    icon: '🏖️',
    active: true,
  });

  // Sick Leave
  const sickLeave = await LeaveTypeModel.create({
    name: 'Sick Leave',
    code: 'SL',
    description: 'Medical leave for illness or injury',
    paidLeave: true,
    requiresApproval: true,
    accrualBased: true,
    carryForwardAllowed: false,
    requiresAttachment: true,
    attachmentType: AttachmentType.MEDICAL,
    color: '#ef4444', // Red
    icon: '🏥',
    active: true,
  });

  // Emergency Leave
  const emergencyLeave = await LeaveTypeModel.create({
    name: 'Emergency Leave',
    code: 'EL',
    description: 'Leave for family emergencies or urgent personal matters',
    paidLeave: true,
    requiresApproval: true,
    accrualBased: false,
    carryForwardAllowed: false,
    requiresAttachment: false,
    color: '#f59e0b', // Orange
    icon: '🚨',
    active: true,
  });

  // Maternity Leave
  const maternityLeave = await LeaveTypeModel.create({
    name: 'Maternity Leave',
    code: 'ML',
    description: 'Paid leave for expecting mothers',
    paidLeave: true,
    requiresApproval: true,
    accrualBased: false,
    carryForwardAllowed: false,
    requiresAttachment: true,
    attachmentType: AttachmentType.MEDICAL,
    color: '#ec4899', // Pink
    icon: '🤱',
    active: true,
  });

  // Paternity Leave
  const paternityLeave = await LeaveTypeModel.create({
    name: 'Paternity Leave',
    code: 'PL',
    description: 'Paid leave for new fathers',
    paidLeave: true,
    requiresApproval: true,
    accrualBased: false,
    carryForwardAllowed: false,
    requiresAttachment: true,
    attachmentType: AttachmentType.DOCUMENT,
    color: '#3b82f6', // Blue
    icon: '👨‍🍼',
    active: true,
  });

  // Compassionate Leave
  const compassionateLeave = await LeaveTypeModel.create({
    name: 'Compassionate Leave',
    code: 'CL',
    description: 'Leave for bereavement or family illness',
    paidLeave: true,
    requiresApproval: true,
    accrualBased: false,
    carryForwardAllowed: false,
    requiresAttachment: false,
    color: '#6b7280', // Gray
    icon: '🕊️',
    active: true,
  });

  // Study Leave
  const studyLeave = await LeaveTypeModel.create({
    name: 'Study Leave',
    code: 'STL',
    description: 'Leave for educational purposes and examinations',
    paidLeave: false,
    requiresApproval: true,
    accrualBased: false,
    carryForwardAllowed: false,
    requiresAttachment: true,
    attachmentType: AttachmentType.OTHER,
    color: '#8b5cf6', // Purple
    icon: '📚',
    active: true,
  });

  // Unpaid Leave
  const unpaidLeave = await LeaveTypeModel.create({
    name: 'Unpaid Leave',
    code: 'UL',
    description: 'Leave without pay',
    paidLeave: false,
    requiresApproval: true,
    accrualBased: false,
    carryForwardAllowed: false,
    requiresAttachment: false,
    color: '#64748b', // Slate
    icon: '⏸️',
    active: true,
  });

  console.log('Leave Types seeded successfully.');

  console.log('Seeding Leave Policies...');

  // Standard Working Calendar
  const standardCalendar = await CalendarModel.create({
    name: 'Standard Working Calendar',
    description: 'Monday to Friday, 5-day work week',
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    weekendDays: [0, 6], // Sat-Sun
    isDefault: true,
  });

  // Annual Leave Policy
  const annualLeavePolicy = await LeavePolicyModel.create({
    leaveType: annualLeave._id,
    name: 'Standard Annual Leave Policy',
    description: 'Standard annual leave entitlement for all employees',
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: null,
    calendar: standardCalendar._id,
    
    // Entitlement rules
    entitlementDays: 21,
    accrualRate: 1.75, // 21 days / 12 months
    accrualFrequency: 'monthly',
    maxAccrualDays: 21,
    
    // Request rules
    minNoticeDays: 7,
    maxConsecutiveDays: 15,
    minRequestDays: 0.5,
    maxRequestDays: 15,
    
    // Approval workflow
    requiresManagerApproval: true,
    requiresHrApproval: false,
    autoApprovalThreshold: null,
    
    // Carry forward
    allowCarryForward: true,
    maxCarryForwardDays: 5,
    carryForwardExpiry: 90,
    
    // Proration
    prorateOnJoining: true,
    prorateOnLeaving: true,
    prorateMethod: 'monthly',
    roundingRule: RoundingRule.ROUND,
    
    // Advanced
    allowNegativeBalance: false,
    encashmentAllowed: true,
    maxEncashmentDays: 10,
    
    isActive: true,
  });

  // Sick Leave Policy
  const sickLeavePolicy = await LeavePolicyModel.create({
    leaveType: sickLeave._id,
    name: 'Standard Sick Leave Policy',
    description: 'Medical leave policy for illness and injury',
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: null,
    calendar: standardCalendar._id,
    
    entitlementDays: 14,
    accrualRate: 1.17, // 14 days / 12 months
    accrualFrequency: 'monthly',
    maxAccrualDays: 14,
    
    minNoticeDays: 0, // Can be taken immediately
    maxConsecutiveDays: 14,
    minRequestDays: 0.5,
    maxRequestDays: 14,
    
    requiresManagerApproval: true,
    requiresHrApproval: false,
    autoApprovalThreshold: 2, // Auto-approve up to 2 days
    
    allowCarryForward: false,
    prorateOnJoining: true,
    prorateOnLeaving: false,
    roundingRule: RoundingRule.ROUND,
    
    allowNegativeBalance: true, // Allow going negative in emergencies
    maxNegativeBalance: -5,
    encashmentAllowed: false,
    
    isActive: true,
  });

  // Emergency Leave Policy  
  const emergencyLeavePolicy = await LeavePolicyModel.create({
    leaveType: emergencyLeave._id,
    name: 'Emergency Leave Policy',
    description: 'Leave for urgent family or personal emergencies',
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: null,
    calendar: standardCalendar._id,
    
    entitlementDays: 5,
    accrualRate: 0,
    accrualFrequency: 'yearly',
    maxAccrualDays: 5,
    
    minNoticeDays: 0,
    maxConsecutiveDays: 3,
    minRequestDays: 0.5,
    maxRequestDays: 3,
    
    requiresManagerApproval: true,
    requiresHrApproval: true,
    
    allowCarryForward: false,
    prorateOnJoining: false,
    prorateOnLeaving: false,
    roundingRule: RoundingRule.ROUND,
    
    allowNegativeBalance: false,
    encashmentAllowed: false,
    
    isActive: true,
  });

  console.log('Leave Policies seeded successfully.');

  console.log('Seeding Leave Entitlements for employees...');
  
  if (employees && employees.length > 0) {
    const currentYear = new Date().getFullYear();
    const entitlements: any[] = [];

    for (const employee of employees) {
      // Annual Leave Entitlement
      entitlements.push({
        employee: employee._id,
        leaveType: annualLeave._id,
        policy: annualLeavePolicy._id,
        year: currentYear,
        totalDays: 21,
        usedDays: 0,
        pendingDays: 0,
        available: 21,
        carriedForward: 0,
        accrued: 21,
        encashed: 0,
      });

      // Sick Leave Entitlement
      entitlements.push({
        employee: employee._id,
        leaveType: sickLeave._id,
        policy: sickLeavePolicy._id,
        year: currentYear,
        totalDays: 14,
        usedDays: 0,
        pendingDays: 0,
        available: 14,
        carriedForward: 0,
        accrued: 14,
        encashed: 0,
      });

      // Emergency Leave Entitlement
      entitlements.push({
        employee: employee._id,
        leaveType: emergencyLeave._id,
        policy: emergencyLeavePolicy._id,
        year: currentYear,
        totalDays: 5,
        usedDays: 0,
        pendingDays: 0,
        available: 5,
        carriedForward: 0,
        accrued: 5,
        encashed: 0,
      });
    }

    await LeaveEntitlementModel.insertMany(entitlements);
    console.log(`Leave Entitlements created for ${employees.length} employees.`);
  } else {
    console.log('No employees found. Skipping entitlement creation.');
  }

  console.log('✅ Leave Management seeding completed successfully!');

  return {
    leaveTypes: [
      annualLeave,
      sickLeave,
      emergencyLeave,
      maternityLeave,
      paternityLeave,
      compassionateLeave,
      studyLeave,
      unpaidLeave,
    ],
    policies: [
      annualLeavePolicy,
      sickLeavePolicy,
      emergencyLeavePolicy,
    ],
    calendar: standardCalendar,
  };
}
