import { useQuery } from '@tanstack/react-query';
import { incidentsService } from '@/services/incidents.service';

export const INCIDENTS_QUERY_KEY = ['incidents'];

export function useIncidents(params = {}, options = {}) {
  return useQuery({
    queryKey: [...INCIDENTS_QUERY_KEY, params],
    queryFn: () => incidentsService.getIncidents(params),
    ...options,
  });
}

export function useIncident(id, options = {}) {
  return useQuery({
    queryKey: [...INCIDENTS_QUERY_KEY, id],
    queryFn: () => incidentsService.getIncidentById(id),
    enabled: Boolean(id),
    ...options,
  });
}
