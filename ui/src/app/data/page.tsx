'use client';

import FormulaBar from '@/components/FormulaBar';
import { FormulaStore, FormulaStoreContext } from '@/stores/FormulaStore';

export default function Home() {
  return (
    <FormulaStoreContext.Provider value={FormulaStore}>
      <FormulaBar />

      <div className='p-16'></div>
    </FormulaStoreContext.Provider>
  );
}
