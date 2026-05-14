/** Custom hook: refetches TanStack Query data when screen comes into focus.
 * Essential for keeping dashboard data fresh in a tab-based navigation app.
 */
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Invalidates the given query keys whenever the screen gains focus.
 * Usage: `useRefreshOnFocus(['customerJobs', userId])`
 */
export function useRefreshOnFocus(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]),
  );
}
