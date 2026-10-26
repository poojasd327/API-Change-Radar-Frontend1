import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checksService } from '@/services/checks.service';

export const CHECKS_HISTORY_QUERY_KEY = ['checks-history'];
export const CHECKS_LATEST_QUERY_KEY = ['checks-latest'];

export function useChecksHistory(params = {}, options = {}) {
  return useQuery({
    queryKey: [...CHECKS_HISTORY_QUERY_KEY, params],
    queryFn: () => checksService.getCheckHistory(params),
    ...options,
  });
}

export function useLatestCheck(options = {}) {
  return useQuery({
    queryKey: CHECKS_LATEST_QUERY_KEY,
    queryFn: () => checksService.getLatestCheck(),
    ...options,
  });
}

export function useRunMockCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => checksService.runMockCheck(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHECKS_HISTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CHECKS_LATEST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
