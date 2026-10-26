import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusPageService } from '@/services/status-page.service';

export const STATUS_PAGE_QUERY_KEY = ['status-page-me'];

export function useMyStatusPage(options = {}) {
  return useQuery({
    queryKey: STATUS_PAGE_QUERY_KEY,
    queryFn: () => statusPageService.getMyStatusPage(),
    retry: false,
    ...options,
  });
}

export function useCreateStatusPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => statusPageService.createStatusPage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATUS_PAGE_QUERY_KEY });
    },
  });
}

export function useUpdateStatusPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => statusPageService.updateStatusPage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATUS_PAGE_QUERY_KEY });
    },
  });
}

export function useUpdateStatusPageServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => statusPageService.updateServices(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATUS_PAGE_QUERY_KEY });
    },
  });
}

export function useRegenerateSlug() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => statusPageService.regenerateSlug(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATUS_PAGE_QUERY_KEY });
    },
  });
}

export function usePublicStatus(slug, options = {}) {
  return useQuery({
    queryKey: ['public-status', slug],
    queryFn: () => statusPageService.getPublicStatus(slug),
    enabled: Boolean(slug),
    ...options,
  });
}
