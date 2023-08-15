'use client';

import FormulaServiceTable from '@/components/FormulaServiceTable';

export default function Home() {
  return (
    <>
      <div className='sticky top-0 px-16 py-8 bg-white'>
        <span className='flex border-b pb-2'>services</span>
      </div>
      <div className='px-16 py-4 max-h-fit'>
        <FormulaServiceTable />
      </div>
    </>
  );
}
