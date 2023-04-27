import { requestTemplate } from '@/utils/requestTemplate';
import { useQuery } from '@tanstack/react-query';
import { Formula } from '@/interfaces';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useStore } from 'zustand';
import { useContext } from 'react';
import { createFormulaStore } from '@/stores/FormulaStore';

export const getInstances = requestTemplate((route: string) => ({
  url: '/api/formulas/instances?route=' + route,
  method: 'GET',
}));

export const useInstances = (route: string) => {
  const RouteStore = useContext(RouteStoreContext);
  const [formulaMap, add] = useStore(RouteStore, (s) => [
    s.formulaMap,
    s.actions.formulaMap.add,
  ]);

  return useQuery<Formula[]>(['instances', route], () => getInstances(route), {
    onSuccess: (data) => {
      console.log(data);
      if (route in formulaMap) return;
      const store = createFormulaStore({ instances: data });
      add(route, store);
    },
    refetchOnWindowFocus: false,
  });
};
