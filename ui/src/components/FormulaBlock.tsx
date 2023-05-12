import MicroApp from './MicroApp';

import { useState, memo, useContext } from 'react';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';

const FormulaBlock = ({ instanceId }: { instanceId: number | string }) => {
  const [height, setHeight] = useState<number | null>(null);

  const formulaStore = useContext(FormulaStoreContext);
  const getInstance = useStore(formulaStore, (s) => s.actions.getInstance);
  const instance = getInstance(instanceId)!;

  return (
    <div className='h-full w-full p-1 border shadow-sm rounded-lg flex flex-col justify-center items-center'>
      <div className='text-sm text-gray-600'>{instance.title}</div>

      <div className={`w-full ${height ? 'h-[' + height + 'px]' : ''}`}>
        <MicroApp
          name={`formula-${instanceId}`}
          url={`${window.location.origin}/formula-ui/${instance.creator}/${instance.slug}/${instance.config?.ui}/index.html`}
          baseroute='/formula'
          onDataChange={(e: CustomEvent) => {
            if (!height) setHeight(e.detail.data.height);
          }}
        />
      </div>
    </div>
  );
};

export default memo(FormulaBlock);
