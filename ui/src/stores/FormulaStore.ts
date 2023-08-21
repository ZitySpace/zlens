import { createContext } from 'react';
import { createStore, StoreApi } from 'zustand';
import produce from 'immer';
import { Formula } from '@/interfaces';

interface Data {
  instances: Formula[];
  selectedInstanceId: string | number | null;
  synced: boolean;
}

const DEFAULT_DATA = {
  instances: [],
  selectedInstanceId: null,
  synced: true,
};

interface Store extends Data {
  actions: {
    add: (formula: Formula) => boolean;
    toggleVisble: (instanceId: string | number) => boolean;
    remove: (instanceId: string | number) => boolean;
    swap: (fromIdx: number, toIdx: number) => boolean;
    select: (idx: number) => boolean;
    setSynced: (synced: boolean) => boolean;
    getInstance: (instanceId: string | number) => Formula | null;
    setInstanceHeight: (instanceId: string | number, height: number) => boolean;
    setInstanceReady: (instanceId: string | number, ready?: boolean) => boolean;
    cloneInstances: (instances: Formula[]) => Formula[];
  };
}

const createThisStore = (initData?: Partial<Data>) =>
  createStore<Store>()((set, get) => ({
    ...DEFAULT_DATA,
    ...initData,
    actions: {
      add: (formula) => {
        set(
          produce((s: Store) => {
            s.instances.push({
              ...formula,
              visible: true,
              instanceId: `${formula.id}-${Math.random()
                .toString(36)
                .substring(2, 7)}`,
              ready: formula.config?.entrypoint ? false : true,
            });
            s.synced = false;
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
            s.synced = false;
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
            s.synced = false;
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

      setSynced: (synced) => {
        set({ synced });
        return true;
      },

      getInstance: (instanceId) => {
        const idx = get().instances.findIndex(
          (formula) => formula.instanceId === instanceId
        );

        if (idx === -1) return null;

        return get().instances[idx];
      },

      setInstanceHeight: (instanceId, height) => {
        const idx = get().instances.findIndex(
          (formula) => formula.instanceId === instanceId
        );

        if (idx === -1) return false;

        set(
          produce((s: Store) => {
            s.instances[idx].height = height;
          })
        );

        return true;
      },

      setInstanceReady: (instanceId, ready = true) => {
        const idx = get().instances.findIndex(
          (formula) => formula.instanceId === instanceId
        );

        if (idx === -1) return false;

        set(
          produce((s: Store) => {
            s.instances[idx].ready = ready;
          })
        );

        return true;
      },

      cloneInstances: (instances) => {
        const clonedInstances = instances.map((instance) => ({
          ...instance,
          instanceId: `${instance.id}-${Math.random()
            .toString(36)
            .substring(2, 7)}`,
        }));
        return clonedInstances;
      },
    },
  }));

const store = createThisStore();
const StoreContext = createContext<StoreApi<Store>>(store);

export {
  type Store as FormulaStoreProps,
  store as FormulaStore,
  StoreContext as FormulaStoreContext,
  createThisStore as createFormulaStore,
};
