import { Formula } from '@/interfaces';
import { useQuery } from '@tanstack/react-query';
import { requestTemplate } from '@/utils/requestTemplate';

export const serveInstance = requestTemplate((formula_id: number) => {
  return {
    url: '/api/formulas/service?formula_id=' + formula_id,
    method: 'POST',
  };
});

export const useServeInstance = (formula: Formula) =>
  useQuery(
    ['service', formula.id],
    () => {
      if (formula.config?.entrypoint.serv) return serveInstance(formula.id);
    },
    {
      refetchOnWindowFocus: false,
    }
  );
