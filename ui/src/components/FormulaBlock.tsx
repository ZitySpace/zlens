import { Formula } from '@/interfaces';
import MicroApp from './MicroApp';

import { useState } from 'react';

const FormulaBlock = ({ formula }: { formula: Formula }) => {
  const [height, setHeight] = useState<number | null>(null);

  return (
    <div className='h-full w-full p-1 border shadow-sm rounded-lg flex flex-col justify-center items-center'>
      <div>{formula.title}</div>
      <div className={`w-full ${height ? 'h-[' + height + 'px]' : ''}`}>
        <MicroApp
          name={`formula-${formula.instanceId}`}
          url={`${window.location.origin}/formula-ui/${formula.creator}/${formula.slug}/${formula.config?.ui}/index.html`}
          baseroute='/formula'
          onDataChange={(e: CustomEvent) => {
            if (!height) setHeight(e.detail.data.height);
          }}
        />
      </div>
    </div>
  );
};

export default FormulaBlock;
