import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import produce from 'immer';
import { FormulaStoreProps } from './FormulaStore';

interface RouteFormulaMap {
  [key: string]: StoreApi<FormulaStoreProps>;
}

interface Data {
  formulaMap: RouteFormulaMap;
  rootReady: boolean;
}

interface Store extends Data {
  actions: {
    formulaMap: {
      add: (route: string, store: StoreApi<FormulaStoreProps>) => boolean;
    };
    setRootReady: (ready: boolean) => void;
  };
}

const store = createStore<Store>((set, get) => ({
  formulaMap: {},
  rootReady: false,
  actions: {
    formulaMap: {
      add: (route, store) => {
        set(
          produce((s: Store) => {
            s.formulaMap = { ...s.formulaMap, [route]: store };
          })
        );
        return true;
      },
    },
    setRootReady: (ready) => {
      set({ rootReady: ready });
    },
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  type Store as RouteStoreProps,
  store as RouteStore,
  StoreContext as RouteStoreContext,
};
