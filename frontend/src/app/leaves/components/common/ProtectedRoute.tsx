// Protected Route Component for Role-Based Access Control
'use client';

import { checkAuth, User, hasRole as checkUserRole } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRoles, redirectTo = '/leaves' }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth().then(fetchedUser => {
      setUser(fetchedUser);
      setLoading(false);
      
      if (fetchedUser) {
        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => checkUserRole(fetchedUser, role));
        
        if (!hasRequiredRole) {
          // Redirect if user doesn't have required role
          router.push(redirectTo);
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });
  }, [requiredRoles, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mb-4 mx-auto"
            style={{ 
              borderColor: 'var(--border-light)',
              borderTopColor: 'var(--primary)'
            }}
          ></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized if user doesn't have required role
  if (user && !requiredRoles.some(role => checkUserRole(user, role))) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--error-light)' }}>
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>Access Denied</h2>
          <p style={{ color: 'var(--gray-600)' }}>You do not have permission to view this page.</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="mt-6 px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show children if authorized
  return <>{children}</>;
}
