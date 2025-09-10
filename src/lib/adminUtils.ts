// Admin access configuration
export const ADMIN_EMAIL = 'yashpatil575757@gmail.com';

// Check if user has admin privileges
export const isUserAdmin = (userEmail: string | undefined): boolean => {
  const result = userEmail === ADMIN_EMAIL;
  console.log('Admin check:', { 
    userEmail: userEmail || 'undefined', 
    ADMIN_EMAIL, 
    isAdmin: result,
    exactMatch: userEmail === 'yashpatil575757@gmail.com'
  });
  return result;
};

// Admin privilege levels
export const AdminPrivileges = {
  MANAGE_ITEMS: 'manage_items',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  SYSTEM_SETTINGS: 'system_settings'
} as const;

// Check if user has specific admin privilege
export const hasAdminPrivilege = (userEmail: string | undefined, _privilege: string): boolean => {
  // Currently only one admin level, but this can be extended for different admin roles
  return isUserAdmin(userEmail);
};

// Admin actions audit log helper
export const logAdminAction = (action: string, details: any) => {
  console.log(`[ADMIN ACTION] ${action}:`, details);
  // In production, this would send to a logging service
};
