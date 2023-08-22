import React, { useState, useRef, useEffect } from 'react';
import {
  LeftCollapseOutlineIcon,
  RightExpandOutlineIcon,
  VResizeSolidIcon,
} from '@/components/Icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FormulaInstanceTable from '@/components/FormulaInstanceTable';
import InstalledFormulaList from '@/components/InstalledFormulaList';

const FormulaBar = () => {
  const [open, setOpen] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);

  const handleCloseBar = (event: MouseEvent) => {
    if (barRef.current && !barRef.current.contains(event.target as Node))
      setOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleCloseBar);

    return () => {
      document.removeEventListener('mousedown', handleCloseBar);
    };
  }, []);

  return (
    <div>
      <div
        className={`fixed h-full right-0 z-10 w-96 pb-28 bg-indigo-50 shadow-md transition duration-500 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        ref={barRef}
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

      <div className='fixed right-0 z-20 bottom-5 h-8 w-16 px-2'>
        {open ? (
          <RightExpandOutlineIcon
            className='w-full h-full text-gray-500 hover:text-gray-700 cursor-pointer'
            onClick={() => setOpen(false)}
          />
        ) : (
          <LeftCollapseOutlineIcon
            className='w-full h-full text-gray-500 hover:text-gray-700 cursor-pointer'
            onClick={() => setOpen(true)}
          />
        )}
      </div>
    </div>
  );
};

export default FormulaBar;
