'use client';

import FormulaBar from '@/components/FormulaBar';
import FormulaStack from '@/components/FormulaStack';
import ToolBar from '@/components/ToolBar';
import RouteTabBar from '@/components/RouteTabBar';

export default function Home() {
  return (
    <>
      <FormulaBar />

      <div className='px-16 py-8 h-full overflow-y-auto scroll-smooth'>
        <RouteTabBar />
        <FormulaStack />
      </div>

      <ToolBar />
    </>
  );
}
