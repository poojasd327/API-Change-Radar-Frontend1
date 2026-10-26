import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsService } from '@/services/contracts.service';
import { ENDPOINTS_QUERY_KEY } from './useEndpoints';

export const CONTRACTS_QUERY_KEY = ['contracts'];

export function useContracts(params = {}, options = {}) {
  return useQuery({
    queryKey: [...CONTRACTS_QUERY_KEY, params],
    queryFn: () => contractsService.getContracts(params),
    ...options,
  });
}

export function useContract(id, options = {}) {
  return useQuery({
    queryKey: [...CONTRACTS_QUERY_KEY, id],
    queryFn: () => contractsService.getContractById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => contractsService.createContract(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ENDPOINTS_QUERY_KEY });
    },
  });
}

export function useValidateContract() {
  return useMutation({
    mutationFn: (payload) => contractsService.validateContract(payload),
  });
}

export function useInferContract() {
  return useMutation({
    mutationFn: (payload) => contractsService.inferContract(payload),
  });
}

export function useApproveContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => contractsService.approveContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ENDPOINTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['checks-history'] });
      queryClient.invalidateQueries({ queryKey: ['checks-latest'] });
    },
  });
}

export function useDeactivateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => contractsService.deactivateContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ENDPOINTS_QUERY_KEY });
    },
  });
}
