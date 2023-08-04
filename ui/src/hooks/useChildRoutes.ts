import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';

export const getChildRoutes = requestTemplate((route: string) => ({
  url: '/api/formulas/children-routes?route=' + route,
  method: 'GET',
}));

export const useChildRoutes = (route: string) => {
  return useQuery<{ route: string }[], String>(
    ['childRoutes', route],
    () => getChildRoutes(route),
    {
      refetchOnWindowFocus: false,
    }
  );
};
