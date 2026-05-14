/** Auth Service — Real Supabase authentication.
 * Per ADR-010 (JWT via Supabase Auth) and Master Guidelines Phase 5.
 *
 * Replaces all mock/demo auth with real Supabase signUp/signIn/signOut
 * and profile management.
 */
import { supabase } from './supabase';
import { logAudit, AuditActions } from './audit-service';
import type { User, UserRole, ApiResponse } from '../types';

/**
 * Creates a new user account and application profile.
 *
 * Flow: supabase.auth.signUp → INSERT users → audit log
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: UserRole,
  tenantId?: string,
): Promise<ApiResponse<User | null>> {
  try {
    /* 1. Create Supabase Auth account */
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message ?? 'Registration failed',
        data: null,
        errors: [authError?.message ?? 'Unknown auth error'],
      };
    }

    /* 2. Insert application profile into users table */
    const profile: Omit<User, 'created_at' | 'updated_at' | 'deleted_at'> = {
      id: authData.user.id,
      tenant_id: tenantId ?? null,
      role: role as UserRole,
      name,
      email,
      avatar_url: null,
      phone: phone || null,
    };

    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert(profile)
      .select()
      .single();

    if (profileError) {
      return {
        success: false,
        message: 'Account created but profile setup failed',
        data: null,
        errors: [profileError.message],
      };
    }

    /* 3. Audit log */
    logAudit(authData.user.id, AuditActions.USER_SIGNED_UP, 'users', authData.user.id, {
      role,
      email,
    });

    return {
      success: true,
      message: 'Account created successfully',
      data: userData as User,
      errors: [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message, data: null, errors: [message] };
  }
}

/**
 * Authenticates an existing user via email/password.
 *
 * Flow: supabase.auth.signInWithPassword → fetch user profile → audit log
 */
export async function signIn(
  email: string,
  password: string,
): Promise<ApiResponse<{ user: User; session: unknown } | null>> {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.session) {
      return {
        success: false,
        message: authError?.message ?? 'Invalid credentials',
        data: null,
        errors: [authError?.message ?? 'AUTH_INVALID_CREDENTIALS'],
      };
    }

    /* Fetch full user profile */
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .is('deleted_at', null)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: 'User profile not found',
        data: null,
        errors: [profileError?.message ?? 'Profile missing'],
      };
    }

    logAudit(authData.user.id, AuditActions.USER_SIGNED_IN, 'users', authData.user.id, {
      method: 'email',
    });

    return {
      success: true,
      message: 'Signed in successfully',
      data: { user: profile as User, session: authData.session },
      errors: [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message, data: null, errors: [message] };
  }
}

/**
 * Signs out the current user and clears the session.
 */
export async function signOut(actorId?: string): Promise<ApiResponse<null>> {
  try {
    if (actorId) {
      logAudit(actorId, AuditActions.USER_SIGNED_OUT, 'users', actorId);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
        data: null,
        errors: [error.message],
      };
    }

    return { success: true, message: 'Signed out', data: null, errors: [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message, data: null, errors: [message] };
  }
}

/**
 * Retrieves the current active Supabase session (for app restart restoration).
 */
export async function getSession(): Promise<ApiResponse<unknown>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }
    return { success: true, message: 'Session retrieved', data: data.session, errors: [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message, data: null, errors: [message] };
  }
}

/**
 * Fetches the full application profile for the currently authenticated user.
 */
export async function getCurrentUser(): Promise<ApiResponse<User | null>> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, message: 'Not authenticated', data: null, errors: ['No session'] };
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .is('deleted_at', null)
      .single();

    if (error || !profile) {
      return {
        success: false,
        message: 'Profile not found',
        data: null,
        errors: [error?.message ?? 'Missing profile'],
      };
    }

    return { success: true, message: 'User retrieved', data: profile as User, errors: [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message, data: null, errors: [message] };
  }
}

/**
 * Updates the current user's profile fields.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar_url'>>,
): Promise<ApiResponse<User | null>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(userId, AuditActions.USER_PROFILE_UPDATED, 'users', userId, {
      fields_changed: Object.keys(updates),
    });

    return { success: true, message: 'Profile updated', data: data as User, errors: [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message, data: null, errors: [message] };
  }
}
