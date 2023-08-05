import {
  FloppySyncOutlineIcon,
  TableCellOutlineIcon,
  ListTreeOutlineIcon,
  NewFormOutlineIcon,
  RectangleGroupOutlineIcon,
} from './Icons';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { RouteStoreContext, View } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { useSyncInstances } from '@/hooks/useSyncInstances';
import { usePathname } from 'next/navigation';

const ToolBar = () => {
  const formulaStore = useContext(FormulaStoreContext);
  const synced = useStore(formulaStore, (s) => s.synced);
  const route = usePathname();
  const syncInstances = useSyncInstances();

  const RouteStore = useContext(RouteStoreContext);
  const [view, setView] = useStore(RouteStore, (s) => [
    s.view,
    s.actions.setView,
  ]);

  return (
    <div className='flex justify-end items-center space-x-4'>
      <RectangleGroupOutlineIcon
        className={`w-6 h-6 ${
          view === 'FORMULA'
            ? 'text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        } cursor-pointer`}
        onClick={() => setView(View.FORMULA)}
      />
      <TableCellOutlineIcon
        className={`w-6 h-6 ${
          view === 'TABLE'
            ? 'text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        } cursor-pointer`}
        onClick={() => setView(View.TABLE)}
      />
      <ListTreeOutlineIcon
        className={`w-6 h-6 ${
          view === 'TREE'
            ? 'text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        } cursor-pointer`}
        onClick={() => setView(View.TREE)}
      />
      <NewFormOutlineIcon
        className={`w-6 h-6 ${
          view === 'NEW'
            ? 'text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        } cursor-pointer`}
        onClick={() => setView(View.NEW)}
      />

      {synced ? (
        <FloppySyncOutlineIcon className='w-6 h-6 text-gray-300 cursor-not-allowed' />
      ) : (
        <FloppySyncOutlineIcon
          className='w-6 h-6 text-yellow-500 hover:text-yellow-600 cursor-pointer'
          onClick={() => syncInstances(route)}
        />
      )}
    </div>
  );
};

export default ToolBar;
