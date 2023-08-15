import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const startServiceRequest = requestTemplate((formulaId: string) => ({
  url: '/api/formulas/services?formula_id=' + formulaId,
  method: 'POST',
}));

export const useStartService = () => {
  const queryClient = useQueryClient();

  const startServiceMutation = useMutation(
    async ({ formulaId }: { formulaId: string }) => {
      const startServiceUntilSucceed = async () => {
        const { status } = await startServiceRequest(formulaId);

        if (status === 'serving') {
          clearInterval(intervalId);
          queryClient.invalidateQueries(['services']);
        }
      };

      const intervalId = setInterval(startServiceUntilSucceed, 2000);

      await startServiceUntilSucceed();
    }
  );

  const startService = (formulaId: string) =>
    startServiceMutation.mutate({
      formulaId,
    });

  return { startService, startServiceMutation };
};
