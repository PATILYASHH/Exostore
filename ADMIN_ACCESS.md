# Admin Access Configuration

## Overview
This document outlines the admin access setup for the Yashstore application. Admin privileges are restricted to a single authorized email account for security purposes.

## Admin Configuration

### Authorized Admin Email
```
yashpatil575757@gmail.com
```

Only this email address has full administrative privileges to:
- Access the admin panel
- Create, edit, and delete store items
- View analytics and statistics
- Manage all store content

## Security Implementation

### 1. Frontend Access Control
- **Auth Context**: The `AuthContext` checks if the logged-in user's email matches the admin email
- **Admin Panel**: Protected route that requires both authentication and admin privileges
- **UI Elements**: Admin-only buttons and features are conditionally rendered

### 2. Database Security (Row Level Security)
The Supabase database has RLS policies that enforce admin access:

```sql
-- Only admin can insert/update/delete store items
CREATE POLICY "Admin can manage store items"
  ON store_items
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'yashpatil575757@gmail.com'
  );
```

### 3. Access Verification
- Users must be authenticated via Supabase Auth
- Email verification required for account creation
- Admin status checked on every sensitive operation

## Admin Features

### Dashboard
- Real-time statistics overview
- Quick action buttons
- Category and type distribution
- Recent items preview

### Item Management
- Full CRUD operations on store items
- Advanced search and filtering
- Bulk operations support
- Image and file management

### Security Features
- Action logging for audit trails
- Confirmation dialogs for destructive actions
- Session management
- Automatic logout on session expiry

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx        # Authentication and admin checking
├── components/
│   └── AdminPanel.tsx         # Main admin interface
├── lib/
│   ├── adminUtils.ts          # Admin utility functions
│   └── supabase.ts           # Database configuration
└── supabase/
    └── migrations/
        └── *.sql             # Database schema and policies
```

## Environment Variables

Ensure these are set in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Changing Admin Access

To change the admin email:

1. **Update AuthContext.tsx**:
   ```typescript
   const isAdmin = user?.email === 'new-admin@example.com';
   ```

2. **Update Database Policy**:
   ```sql
   DROP POLICY "Admin can manage store items" ON store_items;
   CREATE POLICY "Admin can manage store items"
     ON store_items
     FOR ALL
     TO authenticated
     USING (
       auth.jwt() ->> 'email' = 'new-admin@example.com'
     )
     WITH CHECK (
       auth.jwt() ->> 'email' = 'new-admin@example.com'
     );
   ```

3. **Update adminUtils.ts**:
   ```typescript
   export const ADMIN_EMAIL = 'new-admin@example.com';
   ```

## Security Best Practices

1. **Keep admin credentials secure**
2. **Regularly review access logs**
3. **Use strong passwords and 2FA**
4. **Monitor for suspicious activity**
5. **Regular security audits**

## Troubleshooting

### Access Denied Issues
1. Verify you're logged in with the correct email
2. Check browser session/cookies
3. Ensure Supabase connection is working
4. Verify database policies are active

### Database Connection Issues
1. Check environment variables
2. Verify Supabase project status
3. Check network connectivity
4. Review Supabase logs

For any issues or questions, contact the system administrator.
