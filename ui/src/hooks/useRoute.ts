import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';

export const getRoute = requestTemplate((route: string) => ({
  url: '/api/formulas/route?route=' + route,
  method: 'GET',
}));

export const useRoute = (route: string) => {
  return useQuery<unknown, String>(['route', route], () => getRoute(route), {
    refetchOnWindowFocus: false,
  });
};
