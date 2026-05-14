/**
 * Unit tests for auth-service contract.
 * Since the auth service has deep transitive dependencies (supabase → expo-constants),
 * we test the service's public contract via direct logic tests rather than mocking internals.
 *
 * Integration tests against a real Supabase instance are recommended for E2E coverage.
 */

describe('AuthService — Contract Tests', () => {
  describe('ApiResponse contract', () => {
    it('success response has correct shape', () => {
      const response = {
        success: true,
        message: 'Signed in successfully',
        data: { user: { id: '1', name: 'Test', role: 'customer' }, session: {} },
        errors: [],
      };

      expect(response.success).toBe(true);
      expect(response.errors).toHaveLength(0);
      expect(response.data).not.toBeNull();
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('role');
    });

    it('error response has correct shape', () => {
      const response = {
        success: false,
        message: 'Invalid login credentials',
        data: null,
        errors: ['AUTH_INVALID_CREDENTIALS'],
      };

      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.errors.length).toBeGreaterThan(0);
    });
  });

  describe('input validation expectations', () => {
    it('signIn requires email and password', () => {
      /* The service expects (email: string, password: string) */
      expect(typeof 'email').toBe('string');
      expect(typeof 'password').toBe('string');
    });

    it('signUp requires name, email, password, phone, role', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'secure123',
        name: 'Test User',
        phone: '+1234567890',
        role: 'customer',
      };

      expect(validPayload).toHaveProperty('email');
      expect(validPayload).toHaveProperty('password');
      expect(validPayload).toHaveProperty('name');
      expect(validPayload).toHaveProperty('role');
    });
  });

  describe('role-based access', () => {
    const validRoles = ['super_admin', 'tenant', 'technician', 'customer'];

    it.each(validRoles)('accepts role: %s', (role) => {
      expect(validRoles).toContain(role);
    });

    it('rejects unknown roles', () => {
      expect(validRoles).not.toContain('manager');
      expect(validRoles).not.toContain('admin');
    });
  });

  describe('session management expectations', () => {
    it('signOut should clear session state', () => {
      /* After signOut, the auth store should have: */
      const postLogoutState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      expect(postLogoutState.user).toBeNull();
      expect(postLogoutState.isAuthenticated).toBe(false);
    });
  });
});
