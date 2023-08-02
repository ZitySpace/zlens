'use client';

import FormulaBar from '@/components/FormulaBar';
import FormulaStack from '@/components/FormulaStack';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { useInstances } from '@/hooks/useInstances';
import { usePathname } from 'next/navigation';
import { SpinnerSolidIcon, WarningOutlineIcon } from '@/components/Icons';
import ToolBar from '@/components/ToolBar';

export default function Home() {
  const route = usePathname();

  const RouteStore = useContext(RouteStoreContext);
  const store = useStore(RouteStore, (s) => s.formulaMap[route]);

  const { isLoading, isFetching, isError } = useInstances(route);

  if (isLoading || isFetching)
    return (
      <div className='h-full w-full flex justify-center items-center text-indigo-400'>
        <SpinnerSolidIcon className='h-8 w-8' />
      </div>
    );

  if (isError)
    return (
      <div className='h-full w-full flex flex-col justify-center items-center space-y-2 text-red-400'>
        <WarningOutlineIcon className='h-12 w-12' />
        <span className='text-sm text-gray-600'>
          Failed to retrieve formula instances
        </span>
      </div>
    );

  return (
    <FormulaStoreContext.Provider value={store}>
      <FormulaBar />

      <div className='p-16 h-full overflow-y-auto scroll-smooth'>
        <FormulaStack />
      </div>

      <ToolBar />
    </FormulaStoreContext.Provider>
  );
}
