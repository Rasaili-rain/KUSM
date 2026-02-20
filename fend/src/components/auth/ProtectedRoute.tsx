import { useAuthStore, UserRole } from '@/stores/authStore';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireSuperAdmin = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // If authentication is required
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedAccess message="Please login to access this feature" />;
  }

  // If super admin is required
  if (requireSuperAdmin && user?.role !== UserRole.SUPER_ADMIN) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedAccess message="Super Admin access required" />;
  }

  // If admin or super admin is required
  if (
    requireAdmin &&
    user?.role !== UserRole.ADMIN &&
    user?.role !== UserRole.SUPER_ADMIN
  ) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedAccess message="Admin access required" />;
  }

  return <>{children}</>;
}

function UnauthorizedAccess({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <p className="text-sm text-gray-500">
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

// Hook for checking permissions in components
export function usePermissions() {
  const { isAuthenticated, user, isAdmin, isSuperAdmin } = useAuthStore();

  return {
    isAuthenticated,
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    user,
    canAccess: (requireAdmin = false, requireSuperAdmin = false) => {
      if (requireSuperAdmin) {
        return user?.role === UserRole.SUPER_ADMIN;
      }
      if (requireAdmin) {
        return (
          user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN
        );
      }
      return isAuthenticated;
    },
  };
}