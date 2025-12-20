'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './apiClient';

export type UserRole = 'PayrollManager' | 'HRManager';

export interface User {
  id: string;
  name?: string;
  workEmail?: string;
  role: UserRole;
  roles?: string[];
  employeeNumber?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Map backend roles to frontend roles
const mapBackendRoleToFrontend = (backendRoles: string[] = []): UserRole => {
  const rolesLower = backendRoles.map(r => r.toLowerCase());
  
  if (rolesLower.includes('payroll manager')) {
    return 'PayrollManager';
  }
  if (rolesLower.includes('hr manager')) {
    return 'HRManager';
  }
  // Default fallback
  return 'PayrollManager';
};

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await apiClient.get('/auth/me');
      
      // Check if userData is null, undefined, or empty
      if (!userData || (typeof userData === 'object' && Object.keys(userData).length === 0)) {
        console.warn('No user data returned from /auth/me', userData);
        setUser(null);
        setError('Not authenticated');
        return;
      }
      
      // Ensure we have at least an id
      const userId = userData.id || userData._id || userData.employeeNumber;
      if (!userId) {
        console.warn('User data missing id field', userData);
        setUser(null);
        setError('Invalid user data');
        return;
      }
      
      // Map backend user data to frontend format
      const mappedUser: User = {
        id: userId,
        name: userData.name || userData.workEmail || 'User',
        workEmail: userData.workEmail,
        employeeNumber: userData.employeeNumber,
        roles: userData.roles || [],
        role: mapBackendRoleToFrontend(userData.roles || []),
      };
      
      setUser(mappedUser);
    } catch (err: any) {
      // Handle 401 (Unauthorized) gracefully - user is just not logged in
      if (err.message && err.message.includes('401')) {
        console.log('User not authenticated (401) - this is expected if not logged in');
        setUser(null);
        setError(null); // Don't show error for unauthenticated users
      } else {
        console.error('Failed to fetch user:', err);
        setError(err.message || 'Failed to load user');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

