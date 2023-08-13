import { Formula } from '@/interfaces';
import { useMutation } from '@tanstack/react-query';
import { requestTemplate } from '@/utils/requestTemplate';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { useContext } from 'react';

export const createInstanceRequest = requestTemplate((formula_id: number) => {
  return {
    url: '/api/formulas/instantiation?formula_id=' + formula_id,
    method: 'POST',
  };
});

export const useCreateInstance = () => {
  const formulaStore = useContext(FormulaStoreContext);
  const add = useStore(formulaStore, (s) => s.actions.add);

  const createInstanceMutation = useMutation(
    (formula: Formula) => createInstanceRequest(formula.id),
    {
      onSuccess: (data, formula) => {
        add(data);
      },
    }
  );

  const createInstance = (formula: Formula) =>
    createInstanceMutation.mutate(formula);

  return createInstance;
};
