import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';

export const createRouteRequest = requestTemplate((route: string) => ({
  url: '/api/formulas/routes?route=' + route,
  method: 'POST',
}));

export const getParentPath = (path: string) =>
  path.slice(
    0,
    path.endsWith('/')
      ? path.lastIndexOf('/', path.length - 2)
      : path.lastIndexOf('/')
  );

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  const RouteStore = useContext(RouteStoreContext);
  const setRootReady = useStore(RouteStore, (s) => s.actions.setRootReady);

  const createRouteMutation = useMutation(
    ({ route }: { route: string }) => createRouteRequest(route),
    {
      onSuccess: (data, { route }) => {
        queryClient.invalidateQueries(['route', route]);
        queryClient.invalidateQueries(['routeTree']);
        if (route === '/formulas') {
          setRootReady(true);
        }
      },
    }
  );

  const createRoute = (route: string) =>
    createRouteMutation.mutate({
      route,
    });

  return { createRoute, createRouteMutation };
};
