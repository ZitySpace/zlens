import { Formula } from '@/interfaces';
import { useMutation } from '@tanstack/react-query';
import { requestTemplate } from '@/utils/requestTemplate';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { useContext } from 'react';

export const postCreateInstance = requestTemplate((formula: Formula) => {
  const formData = new FormData();
  formData.set('formula', JSON.stringify(formula));

  return {
    url: '/api/formulas/instantiation',
    method: 'POST',
    body: formData,
  };
});

export const useCreateInstance = () => {
  const formulaStore = useContext(FormulaStoreContext);
  const add = useStore(formulaStore, (s) => s.actions.add);

  const createInstanceMutation = useMutation(
    (formula: Formula) => postCreateInstance(formula),
    {
      onSuccess: (data, formula) => {
        const instance = { ...formula, version: data.version };
        add(instance);
      },
    }
  );

  const createInstance = (formula: Formula) =>
    createInstanceMutation.mutate(formula);

  return createInstance;
};
