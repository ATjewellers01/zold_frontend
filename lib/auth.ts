export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'PARTNER';
  adminRole?: 'SUPER_ADMIN' | 'OPERATIONS_ADMIN' | 'FINANCE_ADMIN' | 'LOAN_ADMIN' | 'SUPPORT_ADMIN';
  name: string;
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'ADMIN';
};

export const isSuperAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'ADMIN' && user?.adminRole === 'SUPER_ADMIN';
};

export const isPartner = (): boolean => {
  const user = getUser();
  return user?.role === 'PARTNER';
};

export const hasAdminAccess = (...allowedRoles: string[]): boolean => {
  const user = getUser();
  if (!user || user.role !== 'ADMIN') return false;
  
  // Super admin has all access
  if (user.adminRole === 'SUPER_ADMIN') return true;
  
  // Check if user's admin role is in allowed list
  return user.adminRole ? allowedRoles.includes(user.adminRole) : false;
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
