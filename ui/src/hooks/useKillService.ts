import { requestTemplate } from '@/utils/requestTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const killServiceRequest = requestTemplate((formulaAPI: string) => ({
  url: formulaAPI + '/kill',
  method: 'POST',
}));

export const useKillService = () => {
  const queryClient = useQueryClient();

  const killServiceMutation = useMutation(
    ({ formulaAPI }: { formulaAPI: string }) => killServiceRequest(formulaAPI),

    {
      onSuccess: (data, { formulaAPI }) => {
        queryClient.invalidateQueries(['services']);
      },
    }
  );

  const killService = (formulaAPI: string) =>
    killServiceMutation.mutate({
      formulaAPI,
    });

  return { killService, killServiceMutation };
};
