import React, { useState } from 'react';
import {
  LeftCollapseOutlineIcon,
  RightExpandOutlineIcon,
  VResizeSolidIcon,
} from './Icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FormulaInstanceTable from './FormulaInstanceTable';
import InstalledFormulaList from './InstalledFormulaList';

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
          <Panel
            maxSize={75}
            className='flex justify-center px-4 py-2'
            defaultSize={30}
          >
            <FormulaInstanceTable />
          </Panel>

          <PanelResizeHandle className='flex flex-col justify-center items-center'>
            <div className='px-4 w-20 h-3 bg-indigo-100 z-10'>
              <VResizeSolidIcon className='w-full h-full text-gray-400' />
            </div>
            <div className='w-full px-4 -translate-y-[6px]'>
              <div className='h-px w-full bg-gray-200'></div>
            </div>
          </PanelResizeHandle>

          <Panel maxSize={75} className='flex justify-center px-4 py-2'>
            <InstalledFormulaList />
          </Panel>
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
