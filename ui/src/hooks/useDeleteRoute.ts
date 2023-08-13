import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { useRouter, usePathname } from 'next/navigation';

export const deleteRouteRequest = requestTemplate((route: string) => ({
  url: '/api/formulas/route?route=' + route,
  method: 'DELETE',
}));

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  const RouteStore = useContext(RouteStoreContext);
  const deleteRouteInStore = useStore(
    RouteStore,
    (s) => s.actions.formulaMap.delete
  );
  const pathname = usePathname();
  const router = useRouter();

  const deleteRouteMutation = useMutation(
    ({ route }: { route: string }) => deleteRouteRequest(route),
    {
      onSuccess: (data, { route }) => {
        queryClient.invalidateQueries(['routeTree']);
        deleteRouteInStore(route);
        if (pathname.startsWith(route)) router.push('/formulas');
      },
    }
  );

  const deleteRoute = (route: string) =>
    deleteRouteMutation.mutate({
      route,
    });

  return { deleteRoute, deleteRouteMutation };
};
