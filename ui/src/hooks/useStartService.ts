import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useStore } from 'zustand';
import { useContext } from 'react';

const startServiceRequest = requestTemplate(
  (formulaId: string, params?: Record<string, unknown>) => ({
    url: '/api/formulas/services?formula_id=' + formulaId,
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(params),
  })
);

export const useStartService = () => {
  const queryClient = useQueryClient();
  const RouteStore = useContext(RouteStoreContext);
  const updateFormulaParams = useStore(
    RouteStore,
    (s) => s.actions.formulaMap.updateFormulaParams
  );

  const startServiceMutation = useMutation(
    async ({
      formulaId,
      params,
    }: {
      formulaId: string;
      params?: Record<string, unknown>;
    }) => {
      let nTried: number = 0;

      const startServiceUntilSucceed = async () => {
        nTried += 1;

        if (nTried > 5) {
          clearInterval(intervalId);
          return;
        }

        const { status, params: params_ } = await startServiceRequest(
          formulaId,
          params
        );

        if (status === 'serving') {
          clearInterval(intervalId);
          queryClient.invalidateQueries(['services']);
          updateFormulaParams(formulaId, params_);
        }
      };

      const intervalId = setInterval(startServiceUntilSucceed, 2000);

      await startServiceUntilSucceed();
    }
  );

  const startService = (formulaId: string, params?: Record<string, unknown>) =>
    startServiceMutation.mutate({
      formulaId,
      params,
    });

  return { startService, startServiceMutation };
};
