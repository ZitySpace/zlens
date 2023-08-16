import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';
import { Formula } from '@/interfaces';

type ModifiedFormula = Omit<
  Formula,
  'visible' | 'instanceId' | 'height' | 'ready' | 'params' | 'endpoint'
>;
interface ServedFormula extends ModifiedFormula {
  endpoint: string;
  installed_at?: string;
  updated_at?: string;
  served_at: string;
  services: {
    instanceId: string | number;
    route: string;
    status?: string;
  }[];
  serving: boolean;
  docs: string;
}

export const getServicesRequest = requestTemplate(() => ({
  url: '/api/formulas/services',
  method: 'GET',
}));

export const useServices = () => {
  return useQuery<ServedFormula[]>(['services'], () => getServicesRequest(), {
    refetchOnWindowFocus: false,
  });
};
