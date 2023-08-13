import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { useContext } from 'react';
import { Formula } from '@/interfaces';
import { shallow } from 'zustand/shallow';

export const syncInstancesRequest = requestTemplate(
  (instances: Formula[], route: string) => {
    const formData = new FormData();
    formData.set('instances', JSON.stringify(instances));
    formData.set('route', route);

    return {
      url: '/api/formulas/instances',
      method: 'POST',
      body: formData,
    };
  }
);

export const useSyncInstances = () => {
  const formulaStore = useContext(FormulaStoreContext);
  const [instances, setSynced] = useStore(
    formulaStore,
    (s) => [s.instances, s.actions.setSynced],
    shallow
  );

  const queryClient = useQueryClient();

  const syncInstancesMutation = useMutation(
    ({ instances, route }: { instances: Formula[]; route: string }) =>
      syncInstancesRequest(instances, route),
    {
      onSuccess: (data, { route }) => {
        setSynced(true);
        queryClient.setQueryData(['instances', route], instances);
      },
    }
  );

  const syncInstances = (route: string) =>
    syncInstancesMutation.mutate({
      instances,
      route,
    });

  return syncInstances;
};
