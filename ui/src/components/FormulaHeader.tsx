import React from 'react';

import ToolBar from '@/components/ToolBar';
import FormulaBar from './FormulaBar';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';

const FormulaHeader = () => {
  const RouteStore = useContext(RouteStoreContext);
  const view = useStore(RouteStore, (s) => s.view);

  return (
    <>
      <div className='flex justify-between items-center border-b pb-2'>
        <span className='text-gray-700'>Formulas</span>
        <ToolBar />
      </div>

      {view === 'FORMULA' && <FormulaBar />}
    </>
  );
};

export default FormulaHeader;
