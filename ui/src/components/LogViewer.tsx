import { useContext, useEffect, useState, useRef } from 'react';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';
import { tryAPIUrl } from '@/utils/requestTemplate';

const LogViewer = ({ instanceId }: { instanceId: number | string }) => {
  const [logs, setLogs] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);

  const formulaStore = useContext(FormulaStoreContext);

  const getInstance = useStore(formulaStore, (s) => s.actions.getInstance);

  const instance = getInstance(instanceId)!;

  const wsUrl = `${tryAPIUrl('/api').replace(
    /^http/,
    'ws'
  )}/formulas/service/log?formula_id=${instance.id}`;

  const intervalRef = useRef<number>(20);
  const closedRef = useRef<boolean>(false);

  useEffect(() => {
    const askingForLogs = () =>
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          if (closedRef.current) return;

          wsRef.current?.send('LOG');
          askingForLogs();
        }
      }, intervalRef.current);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected.');
      askingForLogs();
    };

    wsRef.current.onmessage = (message) => {
      if (message.data === 'HEY_EASY') {
        intervalRef.current = 1000;
        return;
      } else intervalRef.current = 20;
      setLogs((prevLogs) => prevLogs + message.data);
    };

    wsRef.current.onerror = (error) => {
      console.error(`WebSocket Error: ${error}`);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      console.log('closing the connection');
      closedRef.current = true;
      wsRef.current?.send('CLOSED');
      wsRef.current?.close();
    };
  }, [instanceId, wsUrl]);

  return (
    <pre className='absolute z-[5] top-10 w-full px-4 h-full max-h-80 overflow-scroll bg-white text-sm text-gray-500 shadow-lg rounded-b-lg'>
      {logs}
    </pre>
  );
};

export default LogViewer;
