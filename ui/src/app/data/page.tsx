'use client';

import FormulaBar from '@/components/FormulaBar';
import FormulaStack from '@/components/FormulaStack';
import { FormulaStore, FormulaStoreContext } from '@/stores/FormulaStore';

export default function Home() {
  return (
    <FormulaStoreContext.Provider value={FormulaStore}>
      <FormulaBar />

      <div className='p-16'>
        <FormulaStack />
      </div>
    </FormulaStoreContext.Provider>
  );
}
