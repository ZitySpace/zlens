import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';
import { Formula } from '@/interfaces';

export const getRoutesInstancesRequest = requestTemplate(() => ({
  url: '/api/formulas/routes-instances',
  method: 'GET',
}));

export const useRoutesInstances = () => {
  return useQuery<{ [key: string]: Formula[] }>(
    ['routesInstances'],
    () => getRoutesInstancesRequest(),
    {
      refetchOnWindowFocus: false,
    }
  );
};
