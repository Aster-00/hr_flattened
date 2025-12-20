export interface task {
  _id?: string;
  employeeId: string;
  tasks: {
    name: string;
    department?: string;
    status: 'pending' | 'in_progress' | 'completed';
    deadline?: Date;
    completedAt?: Date;
    documentId?: string;
    notes?: string;
  }[];
  completed?: boolean;
  completedAt?: Date;
}

// A single task inside onboarding
export interface OnboardingTask {
  _id?: string; // optional (task-level id if exists)
  onboardingId: string; // ✅ ADD THIS
  name: string;
  department?: string;
  status: string;
  deadline?: Date;
  completedAt?: Date;
  notes?: string;
}


// A full onboarding record
export interface Onboarding {
  _id: string;
  employeeId: string;    // ObjectId as string
  contractId: string;    // ObjectId as string
  tasks: OnboardingTask[];
  completed: boolean;
  completedAt?: string | Date;
}

export interface NewHire {
  _id: string;
  employeeId: string;
  contractId?: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  signingBonus?: number;
}

export interface CurrentUser {
  id: string;  // ← matches backend
  workEmail: string;
  roles: string[];
  permissions: string[];
  employeeNumber: string;
}
