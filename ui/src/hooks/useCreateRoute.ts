import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';

export const postCreateRoute = requestTemplate((route: string) => ({
  url: '/api/formulas/routes?route=' + route,
  method: 'POST',
}));

const getParentPath = (path: string) =>
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
    ({ route }: { route: string }) => postCreateRoute(route),
    {
      onSuccess: (data, { route }) => {
        queryClient.invalidateQueries(['route', route]);
        if (route !== '/formulas') {
          queryClient.invalidateQueries(['route', getParentPath(route)]);
          queryClient.invalidateQueries(['childRoutes', getParentPath(route)]);
        } else {
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
