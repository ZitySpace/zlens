import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import produce from 'immer';
import { FormulaStoreProps } from './FormulaStore';

interface RouteFormulaMap {
  [key: string]: StoreApi<FormulaStoreProps>;
}

export enum View {
  FORMULA = 'FORMULA',
  TABLE = 'TABLE',
  TREE = 'TREE',
  NEW = 'NEW',
}

interface Data {
  formulaMap: RouteFormulaMap;
  rootReady: boolean;
  view: View;
}

interface Store extends Data {
  actions: {
    formulaMap: {
      add: (route: string, store: StoreApi<FormulaStoreProps>) => boolean;
      rename: (route: string, newRoute: string) => boolean;
      delete: (route: string) => boolean;
    };
    setRootReady: (ready: boolean) => void;
    setView: (view: View) => void;
  };
}

const store = createStore<Store>((set, get) => ({
  formulaMap: {},
  rootReady: false,
  view: View.FORMULA,
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

      rename: (route, newRoute) => {
        set(
          produce((s: Store) => {
            Object.entries(s.formulaMap).forEach(([r, store]) => {
              if (r === route || r.startsWith(`${route}/`)) {
                const newR = r.replace(route, newRoute);
                s.formulaMap[newR] = store;
                delete s.formulaMap[r];
              }
            });
          })
        );
        return true;
      },

      delete: (route) => {
        set(
          produce((s: Store) => {
            Object.keys(s.formulaMap).forEach((r) => {
              if (r === route || r.startsWith(`${route}/`)) {
                delete s.formulaMap[r];
              }
            });
          })
        );
        return true;
      },
    },
    setRootReady: (ready) => {
      set({ rootReady: ready });
    },
    setView: (view) => {
      set({ view });
    },
  },
}));

const StoreContext = createContext<StoreApi<Store>>(store);

export {
  type Store as RouteStoreProps,
  store as RouteStore,
  StoreContext as RouteStoreContext,
};
