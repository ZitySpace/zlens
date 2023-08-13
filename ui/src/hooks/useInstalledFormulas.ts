import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';
import { Formula } from '@/interfaces';

export const getInstalledFormulasRequest = requestTemplate(() => ({
  url: '/api/formulas/installed',
  method: 'GET',
}));

export const useInstalledFormulas = () =>
  useQuery<Formula[]>(['installedFormulas'], getInstalledFormulasRequest, {
    refetchOnWindowFocus: false,
  });
