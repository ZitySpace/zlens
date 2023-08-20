import MicroApp from './MicroApp';

import { useContext, useEffect, useState } from 'react';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';

import { requestTemplate, tryAPIUrl } from '@/utils/requestTemplate';
import { shallow } from 'zustand/shallow';

import {
  DocumentTextOutlineIcon,
  InformationCircleOutlineIcon,
  CogOutlineIcon,
} from '@/components/Icons';

import LogViewer from '@/components/LogViewer';
import FormulaParamPanel from '@/components/FormulaParamPanel';

const serveFormula = requestTemplate((formula_id: number) => {
  return {
    url: '/api/formulas/services?formula_id=' + formula_id,
    method: 'POST',
  };
});

enum Mode {
  DEFAULT,
  DESC,
  LOG,
  CONFIG,
}

const FormulaBlock = ({ instanceId }: { instanceId: number | string }) => {
  const formulaStore = useContext(FormulaStoreContext);
  const [
    getInstance,
    setInstanceHeight,
    setInstanceReady,
    setInstanceParams,
    setInstanceEndpoint,
  ] = useStore(
    formulaStore,
    (s) => [
      s.actions.getInstance,
      s.actions.setInstanceHeight,
      s.actions.setInstanceReady,
      s.actions.setInstanceParams,
      s.actions.setInstanceEndpoint,
    ],
    shallow
  );
  const instance = getInstance(instanceId)!;

  const height = instance.height;
  const ready = instance.ready;

  const formulaUIUrl = process.env.NEXT_PUBLIC_API_PORT
    ? tryAPIUrl(
        `/formula-ui/${instance.creator}/${instance.slug}/${instance.config?.ui}/index.html`
      )
    : `${window.location.origin}/formula-ui/${instance.creator}/${instance.slug}/${instance.config?.ui}/index.html`;

  const [mode, setMode] = useState<Mode>(Mode.DEFAULT);

  useEffect(() => {
    if (ready) return;

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      const { status, endpoint, params } = await serveFormula(instance.id);

      if (status === 'serving') {
        clearInterval(intervalId);
        setInstanceEndpoint(instanceId, tryAPIUrl(`/${endpoint}`));
        setInstanceParams(instanceId, params as Record<string, unknown>);
        setInstanceReady(instanceId);
      }
    };

    intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='relative h-full w-full border shadow-sm rounded-lg flex flex-col justify-center items-center'>
      <div className='px-4 h-10 w-full bg-gray-200 text-sm text-gray-500 rounded-t-lg flex justify-between items-center'>
        <span>
          {instance.title} - {(instanceId as string).split('-')[1]}
        </span>
        <div className='flex justify-start space-x-2 items-center'>
          <InformationCircleOutlineIcon
            className={`w-5 h-5 hover:cursor-pointer ${
              mode === Mode.DESC ? 'text-indigo-600' : ''
            }`}
            onClick={() => {
              setMode(mode === Mode.DESC ? Mode.DEFAULT : Mode.DESC);
            }}
          />
          <DocumentTextOutlineIcon
            className={`w-5 h-5 hover:cursor-pointer ${
              mode === Mode.LOG ? 'text-indigo-600' : ''
            }`}
            onClick={() => {
              setMode(mode === Mode.LOG ? Mode.DEFAULT : Mode.LOG);
            }}
          />
          <CogOutlineIcon
            className={`w-5 h-5 hover:cursor-pointer ${
              mode === Mode.CONFIG ? 'text-indigo-600' : ''
            }`}
            onClick={() => {
              setMode(mode === Mode.CONFIG ? Mode.DEFAULT : Mode.CONFIG);
            }}
          />
        </div>
      </div>

      {mode === Mode.DESC ? (
        <div className='absolute z-[5] top-10 px-4 py-3 bg-white text-sm text-gray-500 shadow-lg rounded-b-lg'>
          {instance.description}
        </div>
      ) : mode === Mode.LOG ? (
        <LogViewer instanceId={instanceId} />
      ) : mode === Mode.CONFIG ? (
        <FormulaParamPanel instanceId={instanceId} />
      ) : null}

      {ready ? (
        <div className={`w-full ${height ? 'h-[' + height + 'px]' : 'h-full'}`}>
          <MicroApp
            name={`formula-${instanceId}`}
            url={formulaUIUrl}
            baseroute='/formula'
            onDataChange={(e: CustomEvent) => {
              if (!height) setInstanceHeight(instanceId, e.detail.data.height);
            }}
            data={{ endpoint: instance.endpoint, params: instance.params }}
            // disableScopecss
          />
        </div>
      ) : (
        <div className='h-60 w-full flex justify-center items-center'>
          getting ready...
        </div>
      )}
    </div>
  );
};

export default FormulaBlock;
