'use client';

import { RouteStoreContext, RouteStore } from '@/stores/RouteStore';
import React from 'react';

export default function RouteStoreContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteStoreContext.Provider value={RouteStore}>
      {children}
    </RouteStoreContext.Provider>
  );
}
