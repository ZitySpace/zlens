import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation } from '@tanstack/react-query';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { useContext } from 'react';
import { Formula } from '@/interfaces';
import { shallow } from 'zustand/shallow';
import { useQueryClient } from '@tanstack/react-query';

export const postSyncInstances = requestTemplate(
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

export const useSyncInstances = (route: string) => {
  const formulaStore = useContext(FormulaStoreContext);
  const [instances, setSynced] = useStore(
    formulaStore,
    (s) => [s.instances, s.actions.setSynced],
    shallow
  );

  const queryClient = useQueryClient();

  const syncInstancesMutation = useMutation(
    ({ instances, route }: { instances: Formula[]; route: string }) =>
      postSyncInstances(instances, route),
    {
      onSuccess: () => {
        setSynced(true);
        queryClient.setQueryData(['instances', route], instances);
      },
    }
  );

  const syncInstances = () =>
    syncInstancesMutation.mutate({
      instances,
      route,
    });

  return syncInstances;
};
