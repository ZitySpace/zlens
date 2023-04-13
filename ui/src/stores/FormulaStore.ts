import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import produce from 'immer';
import { Formula } from '@/interfaces';

interface Store {
  instances: Formula[];
  selectedInstanceId: string | number | null;

  actions: {
    add: (formula: Formula) => boolean;
    toggleVisble: (instanceId: string | number) => boolean;
    remove: (instanceId: string | number) => boolean;
    swap: (fromIdx: number, toIdx: number) => boolean;
    select: (idx: number) => boolean;
  };
}

const store = createStore<Store>((set, get) => ({
  instances: [],
  selectedInstanceId: null,

  actions: {
    add: (formula) => {
      set(
        produce((s: Store) => {
          s.instances.push({
            ...formula,
            visible: true,
            instanceId: `${formula.id}-${Math.random()
              .toString(36)
              .substring(2, 5)}`,
          });
        })
      );
      return true;
    },

    toggleVisble: (instanceId) => {
      const idx = get().instances.findIndex(
        (formula) => formula.instanceId === instanceId
      );

      if (idx === -1) return false;

      set(
        produce((s: Store) => {
          s.instances[idx].visible = !s.instances[idx].visible;
        })
      );

      return true;
    },

    remove: (instanceId) => {
      const idx = get().instances.findIndex(
        (formula) => formula.instanceId === instanceId
      );

      if (idx === -1) return false;

      set(
        produce((s: Store) => {
          s.instances.splice(idx, 1);
          s.selectedInstanceId = null;
        })
      );

      return true;
    },

    swap: (fromIdx, toIdx) => {
      set(
        produce((s: Store) => {
          const formula = s.instances[fromIdx];
          s.instances[fromIdx] = s.instances[toIdx];
          s.instances[toIdx] = formula;
        })
      );
      return true;
    },

    select: (idx) => {
      const formula = get().instances[idx];
      if (!formula) return false;

      set({ selectedInstanceId: formula.instanceId ?? null });
      return true;
    },
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  type Store as FormulaStoreProps,
  store as FormulaStore,
  StoreContext as FormulaStoreContext,
};
