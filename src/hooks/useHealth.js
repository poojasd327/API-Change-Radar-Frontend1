import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/services/health.service';

export const HEALTH_QUERY_KEY = ['backend-health'];

export function useHealth(options) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: () => healthService.getHealth(),
    retry: 1,
    refetchInterval: options?.refetchInterval ?? false,
  });
}
