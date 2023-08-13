import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';

export const getRouteTreeRequest = requestTemplate(() => ({
  url: '/api/formulas/route-tree',
  method: 'GET',
}));

export const useRouteTree = () => {
  return useQuery(['routeTree'], () => getRouteTreeRequest(), {
    refetchOnWindowFocus: false,
  });
};
