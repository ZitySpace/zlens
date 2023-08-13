import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { useRouter, usePathname } from 'next/navigation';

export const renameRouteRequest = requestTemplate(
  (route: string, newRoute: string) => ({
    url: '/api/formulas/route?route=' + route + '&new_route=' + newRoute,
    method: 'PATCH',
  })
);

export const useRenameRoute = () => {
  const queryClient = useQueryClient();
  const RouteStore = useContext(RouteStoreContext);
  const renameRouteInStore = useStore(
    RouteStore,
    (s) => s.actions.formulaMap.rename
  );
  const pathname = usePathname();
  const router = useRouter();

  const renameRouteMutation = useMutation(
    ({ route, newRoute }: { route: string; newRoute: string }) =>
      renameRouteRequest(route, newRoute),
    {
      onSuccess: (data, { route, newRoute }) => {
        queryClient.invalidateQueries(['routeTree']);
        renameRouteInStore(route, newRoute);
        if (pathname.startsWith(route))
          router.push(pathname.replace(route, newRoute));
      },
    }
  );

  const renameRoute = (route: string, newRoute: string) =>
    renameRouteMutation.mutate({
      route,
      newRoute,
    });

  return { renameRoute, renameRouteMutation };
};
