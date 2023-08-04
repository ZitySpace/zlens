import { FloppySyncOutlineIcon } from './Icons';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { useSyncInstances } from '@/hooks/useSyncInstances';
import { usePathname } from 'next/navigation';

const ToolBar = () => {
  const formulaStore = useContext(FormulaStoreContext);
  const synced = useStore(formulaStore, (s) => s.synced);
  const route = usePathname();
  const syncInstances = useSyncInstances();

  return (
    <div className='fixed right-4 bottom-6 flex flex-col space-y-2 justify-center items-start'>
      {synced ? (
        <FloppySyncOutlineIcon className='w-8 h-8 text-gray-500 cursor-pointer' />
      ) : (
        <FloppySyncOutlineIcon
          className='w-8 h-8 text-yellow-500 hover:text-yellow-600 cursor-pointer'
          onClick={() => syncInstances(route)}
        />
      )}
    </div>
  );
};

export default ToolBar;
