import React from 'react';

import ToolBar from '@/components/ToolBar';
import FormulaBar from './FormulaBar';
import { RouteStoreContext, View } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const FormulaHeader = () => {
  const RouteStore = useContext(RouteStoreContext);
  const view = useStore(RouteStore, (s) => s.view);
  const route = usePathname();
  const segments = route.split('/').filter((segment) => segment !== '');

  return (
    <>
      <div className='flex justify-between items-center border-b pb-2'>
        <div className='flex justify-start space-x-4'>
          {segments.map((seg, i) => {
            const last = i === segments.length - 1;
            return (
              <React.Fragment key={i}>
                <Link
                  href={`/${segments.slice(0, i + 1).join('/')}`}
                  className={`inline-block ${
                    last ? 'text-indigo-600' : 'hover:text-indigo-600'
                  }`}
                >
                  {seg}
                </Link>

                {!last && <span className='text-gray-400'>{'>'}</span>}
              </React.Fragment>
            );
          })}
        </div>

        <ToolBar />
      </div>

      {view === 'FORMULA' && <FormulaBar />}
    </>
  );
};

export default FormulaHeader;
