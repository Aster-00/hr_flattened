import { CurrentUser, OnboardingTask, task } from "./ONtypes";
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
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }


  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // 🔥 REQUIRED
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });
  

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
export const OnApiRecruitment={
    // Create new job requisition
//   createJobRequisition: async (data: JobRequisitionFormData): Promise<JobRequisition> => {
//     return apiCall<JobRequisition>('/recruitment/job-requisitions', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },
    //create tasks 
    createTask: async (data: task): Promise<task> =>{
        return apiCall<task>('/recruitment/onboard',{
            method: 'POST',
            body: JSON.stringify(data),

        });
    },
    getTasks: async ():Promise<OnboardingTask[]>=>{
      return apiCall<OnboardingTask[]>('/recruitment/onboard',{
      method: 'GET'
      });
    },
    
    uploadDocument: async (data: FormData): Promise<any> => {
      return apiCall<any>('/recruitment/uploadDocument', {
        method: 'POST',
        body: data, // ✅ NO stringify
      });
    },

    viewTracker: async (employeeId:string): Promise<any> =>{
      return apiCall<any>(`/recruitment/viewTracker/${employeeId}`,{
        method: 'GET',
      });
    },
    getNewHire: async (): Promise<any> => {
      const endpoint = `/employee-profile/roles?role=Job Candidate`;
      return apiCall<any>(endpoint, {
        method: 'GET',
      });
    }
    ,
    createEP: async (data: any): Promise<any> =>{
          return apiCall<any>('/recruitment/newEmployee',{
            method: 'POST',
            body: JSON.stringify(data),
          });
        },
    initBouns: async (data: any): Promise<any> =>{
      return apiCall<any>('/recruitment/pay-signBonus',{
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    // api/recruitment.ts
     getTracker: async (employeeId: string): Promise<{ tasks: OnboardingTask[] }> => {
      return apiCall<{ tasks: OnboardingTask[] }>(
        `/recruitment/viewTracker/${employeeId}`,
        {
          method: 'GET',
        }
      );
    },
    updateTask: async (taskId: string): Promise<any> => {
      return apiCall<any>(`/recruitment/onboard/${taskId}`, {
        method: 'PUT',
      });
    } ,
    getCurrentUser: async (): Promise<CurrentUser> => {
      return apiCall<CurrentUser>('/auth/me', { method: 'GET' });
    },
    
    
        
      }

    


