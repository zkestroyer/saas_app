import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth-store';
import { UserRole } from '../src/types';

/** Entry point — routes user to auth or their role-specific dashboard. */
export default function Index() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (user?.role) {
    case UserRole.TECHNICIAN:
      return <Redirect href="/(technician)" />;
    case UserRole.TENANT:
      return <Redirect href="/(tenant)" />;
    case UserRole.CUSTOMER:
    default:
      return <Redirect href="/(customer)" />;
  }
}
