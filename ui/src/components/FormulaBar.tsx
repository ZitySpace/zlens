'use client';

import React, { useState } from 'react';
import {
  LeftCollapseOutlineIcon,
  RightExpandOutlineIcon,
  VResizeSolidIcon,
} from './Icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import InstalledFormulaTable from './InstalledFormulaTable';

const FormulaBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed h-full z-10 w-96 bg-indigo-50 shadow-md transition duration-500 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <PanelGroup direction='vertical'>
          <Panel maxSize={75} className='flex justify-center px-4 py-2'>
            <InstalledFormulaTable
              data={[
                { id: 1, name: 'row 1' },
                { id: 2, name: 'row 2' },
                { id: 3, name: 'row 3' },
                { id: 4, name: 'row 4' },
                { id: 5, name: 'row 5' },
                { id: 6, name: 'row 6' },
                { id: 7, name: 'row 7' },
                { id: 8, name: 'row 8' },
                { id: 9, name: 'row 9' },
                { id: 10, name: 'row 10' },
              ]}
            />
          </Panel>
          <PanelResizeHandle className='flex flex-col justify-center items-center'>
            <div className='px-4 w-20 h-3 bg-indigo-100 z-10'>
              <VResizeSolidIcon className='w-full h-full text-gray-400' />
            </div>
            <div className='w-full px-4 -translate-y-[6px]'>
              <div className='h-px w-full bg-gray-200'></div>
            </div>
          </PanelResizeHandle>
          <Panel maxSize={75}>bottom</Panel>
        </PanelGroup>
      </div>

      <div className='fixed z-20 bottom-5 h-8 w-12 px-2'>
        {open ? (
          <LeftCollapseOutlineIcon
            className='w-full h-full text-gray-500 hover:text-gray-700 cursor-pointer'
            onClick={() => setOpen(false)}
          />
        ) : (
          <RightExpandOutlineIcon
            className='w-full h-full text-gray-500 hover:text-gray-700 cursor-pointer'
            onClick={() => setOpen(true)}
          />
        )}
      </div>
    </>
  );
};

export default FormulaBar;
