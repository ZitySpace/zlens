import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { useContext } from 'react';
import { Formula } from '@/interfaces';
import { useRouter } from 'next/navigation';

import { syncInstancesRequest } from '@/hooks/useSyncInstances';

export const useCreateRouteAndSyncInstances = () => {
  const formulaStore = useContext(FormulaStoreContext);

  const [instances, cloneInstances] = useStore(formulaStore, (s) => [
    s.instances,
    s.actions.cloneInstances,
  ]);

  const queryClient = useQueryClient();

  const router = useRouter();

  const createRouteAndSyncInstancesMutation = useMutation(
    ({ instances, route }: { instances: Formula[]; route: string }) =>
      syncInstancesRequest(instances, route),
    {
      onSuccess: (data, { route }) => {
        queryClient.invalidateQueries(['instances', route]);
        queryClient.invalidateQueries(['routeTree']);
        router.push(route);
      },
    }
  );

  const createRouteAndSyncInstances = (route: string) =>
    createRouteAndSyncInstancesMutation.mutate({
      instances: cloneInstances(instances),
      route,
    });

  return createRouteAndSyncInstances;
};
