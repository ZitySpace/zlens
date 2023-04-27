import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import produce from 'immer';
import { FormulaStoreProps } from './FormulaStore';

interface RouteFormulaMap {
  [key: string]: StoreApi<FormulaStoreProps>;
}

interface Data {
  formulaMap: RouteFormulaMap;
}

interface Store extends Data {
  actions: {
    formulaMap: {
      add: (route: string, store: StoreApi<FormulaStoreProps>) => boolean;
    };
  };
}

const store = createStore<Store>((set, get) => ({
  formulaMap: {},
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
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  type Store as RouteStoreProps,
  store as RouteStore,
  StoreContext as RouteStoreContext,
};
