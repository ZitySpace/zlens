import React, { useContext } from 'react';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { VResizeSolidIcon } from '@/components/Icons';
import { useStartService } from '@/hooks/useStartService';
import ParamBlock from '@/components/ParamBlock';

const FormulaParamPanel = ({ instanceId }: { instanceId: number | string }) => {
  const formulaStore = useContext(FormulaStoreContext);

  const getInstance = useStore(formulaStore, (s) => s.actions.getInstance);

  const instance = getInstance(instanceId)!;

  const { startService } = useStartService();

  const servParameters = instance.config?.entrypoint.serv.parameters as Record<
    string,
    {
      type: string;
      default?: unknown;
      [key: string]: unknown;
    }
  >;

  const servParametersValues = instance.served_params as Record<
    string,
    unknown
  >;

  const startServiceHandler = (evt: React.FormEvent) => {
    evt.preventDefault();
    const target = evt.target as HTMLFormElement;

    const params = (
      Array.from(target.elements) as (HTMLInputElement | HTMLButtonElement)[]
    )
      .filter((inp) => inp.type !== 'submit')
      .reduce(
        (acc, el) => ({
          ...acc,
          [el.id]:
            el.type === 'checkbox'
              ? (el as HTMLInputElement).checked
              : el.value,
        }),
        {} as Record<string, unknown>
      );

    startService(instance.id.toString(), params);
  };

  return (
    <div className='px-4 py-3 bg-white text-sm text-gray-500 shadow-lg rounded-b-lg'>
      <PanelGroup
        direction='horizontal'
        className='flex justify-between space-x-1'
      >
        <Panel
          defaultSize={40}
          minSize={30}
          className='bg-slate-100 p-4 rounded-lg'
        >
          <pre className='max-h-full w-full overflow-auto scroll-smooth'>
            {JSON.stringify(
              { config: instance.config, params: instance.served_params },
              null,
              2
            )}
          </pre>
        </Panel>
        <PanelResizeHandle className='rounded-lg overflow-clip'>
          <div className='h-full w-3 bg-white'>
            <VResizeSolidIcon className='w-full h-full text-gray-400 rotate-90' />
          </div>
        </PanelResizeHandle>
        <Panel
          defaultSize={60}
          minSize={50}
          className='bg-slate-100 p-4 rounded-lg'
        >
          <form
            className='max-w-sm flex flex-col justify-start items-start space-y-8'
            onSubmit={startServiceHandler}
          >
            <div className='w-full text-gray-500 border-b border-gray-200 pb-2 font-semibold'>
              Service Parameters
            </div>

            {Object.entries(servParameters).map(([key, config]) => (
              <ParamBlock
                key={key}
                name={key}
                config={config}
                value={servParametersValues[key]}
              />
            ))}

            <div className='w-full flex pt-8'>
              <div className='w-full flex justify-end border-t border-gray-200 pt-4'>
                <button
                  type='submit'
                  className='flex justify-center py-1.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none'
                >
                  OK
                </button>
              </div>
            </div>
          </form>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default FormulaParamPanel;
