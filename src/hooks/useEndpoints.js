import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsService } from '@/services/endpoints.service';

export const ENDPOINTS_QUERY_KEY = ['endpoints'];

export function useEndpoints(params = {}, options = {}) {
  return useQuery({
    queryKey: [...ENDPOINTS_QUERY_KEY, params],
    queryFn: () => endpointsService.getEndpoints(params),
    ...options,
  });
}

export function useEndpoint(id, options = {}) {
  return useQuery({
    queryKey: [...ENDPOINTS_QUERY_KEY, id],
    queryFn: () => endpointsService.getEndpointById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateEndpoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => endpointsService.createEndpoint(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENDPOINTS_QUERY_KEY });
    },
  });
}

export function useUpdateEndpoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => endpointsService.updateEndpoint(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENDPOINTS_QUERY_KEY });
    },
  });
}
