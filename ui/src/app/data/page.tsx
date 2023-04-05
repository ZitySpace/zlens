'use client';

import FormulaBar from '@/components/FormulaBar';
import FormulaStack from '@/components/FormulaStack';
import { FormulaStore, FormulaStoreContext } from '@/stores/FormulaStore';

export default function Home() {
  return (
    <FormulaStoreContext.Provider value={FormulaStore}>
      <FormulaBar />

      <div className='p-16 h-full overflow-y-auto scroll-smooth'>
        <FormulaStack />
      </div>
    </FormulaStoreContext.Provider>
  );
}
