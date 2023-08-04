'use client';

import React, { useEffect } from 'react';

import { usePathname } from 'next/navigation';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { useInstances } from '@/hooks/useInstances';
import { useRoute } from '@/hooks/useRoute';
import { useCreateRoute } from '@/hooks/useCreateRoute';
import { SpinnerSolidIcon, WarningOutlineIcon } from '@/components/Icons';

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const route = usePathname();

  const RouteStore = useContext(RouteStoreContext);
  const rootReady = useStore(RouteStore, (s) => s.rootReady);

  const { createRoute, createRouteMutation: mutation } = useCreateRoute();

  useEffect(() => {
    if (route === '/formulas' && !rootReady) createRoute(route);
  }, [route]);

  if (mutation.isError)
    return (
      <div className='h-full w-full flex flex-col justify-center items-center space-y-2 text-red-400'>
        <WarningOutlineIcon className='h-12 w-12' />
        <span className='text-sm text-gray-600'>
          Failed to create route /formulas
        </span>
      </div>
    );

  return <>{children}</>;
};

const RouteLayout = ({ children }: { children: React.ReactNode }) => {
  const route = usePathname();
  const RouteStore = useContext(RouteStoreContext);
  const store = useStore(RouteStore, (s) => s.formulaMap[route]);

  const {
    isLoading: routeLoading,
    // isFetching: routeFetching,
    isError: routeError,
  } = useRoute(route);

  const {
    isLoading: insLoading,
    // isFetching: insFetching,
    isError: insError,
  } = useInstances(route);

  if (routeError) {
    return (
      <div className='h-full w-full flex flex-col justify-center items-center space-y-2 text-red-400'>
        <WarningOutlineIcon className='h-12 w-12' />
        <span className='text-sm text-gray-600'>{`Route ${route} not found`}</span>
      </div>
    );
  }

  if (insError)
    return (
      <div className='h-full w-full flex flex-col justify-center items-center space-y-2 text-red-400'>
        <WarningOutlineIcon className='h-12 w-12' />
        <span className='text-sm text-gray-600'>
          Failed to retrieve formula instances
        </span>
      </div>
    );

  if (routeLoading || insLoading || !store)
    return (
      <div className='h-full w-full flex justify-center items-center text-indigo-400'>
        <SpinnerSolidIcon className='h-8 w-8' />
      </div>
    );

  return (
    <FormulaStoreContext.Provider value={store}>
      {children}
    </FormulaStoreContext.Provider>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <RouteLayout>{children}</RouteLayout>
    </RouteGuard>
  );
}
