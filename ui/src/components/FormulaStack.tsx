import React, { useContext } from 'react';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { Flipper, Flipped } from 'react-flip-toolkit';

const FormulaStack = () => {
  const formulaStore = useContext(FormulaStoreContext);

  const installed = useStore(formulaStore, (state) => state.installed);

  return (
    <div>
      <Flipper flipKey={installed.map((f) => f.instanceId).join('-')}>
        <div className='flex flex-col space-y-4'>
          {installed.map((f, i) => (
            <Flipped key={f.instanceId} flipId={f.instanceId}>
              <div className='h-36 w-full p-6 shadow-md rounded-lg bg-indigo-300 flex justify-center items-center'>
                {f.title}
              </div>
            </Flipped>
          ))}
        </div>
      </Flipper>
    </div>
  );
};

export default FormulaStack;
