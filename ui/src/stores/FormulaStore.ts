import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import produce from 'immer';
import { Formula } from '@/interfaces';

interface Store {
  installed: Formula[];

  actions: {
    install: (formula: Formula) => boolean;
    toggleVisble: (instanceId: string | number) => boolean;
    uninstall: (instanceId: string | number) => boolean;
    swap: (fromIdx: number, toIdx: number) => boolean;
  };
}

const store = createStore<Store>((set, get) => ({
  installed: [],

  actions: {
    install: (formula) => {
      set(
        produce((s: Store) => {
          s.installed.push({
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
      const idx = get().installed.findIndex(
        (formula) => formula.instanceId === instanceId
      );

      if (idx === -1) return false;

      set(
        produce((s: Store) => {
          s.installed[idx].visible = !s.installed[idx].visible;
        })
      );

      return true;
    },

    uninstall: (instanceId) => {
      const idx = get().installed.findIndex(
        (formula) => formula.instanceId === instanceId
      );

      if (idx === -1) return false;

      set(
        produce((s: Store) => {
          s.installed.splice(idx, 1);
        })
      );

      return true;
    },

    swap: (fromIdx, toIdx) => {
      set(
        produce((s: Store) => {
          const formula = s.installed[fromIdx];
          s.installed[fromIdx] = s.installed[toIdx];
          s.installed[toIdx] = formula;
        })
      );
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
