import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  PlusSolidIcon,
  TrashSolidIcon,
  PencilSolidIcon,
} from '@/components/Icons';
import { useCreateRoute } from '@/hooks/useCreateRoute';
import { useChildRoutes } from '@/hooks/useChildRoutes';

const TabBar = () => {
  const route = usePathname();
  const segments = route.split('/').filter((segment) => segment !== '');
  const [act, setAct] = useState<string | null>(null);
  const actPanelRef = useRef<HTMLDivElement>(null);
  const [inp, setInp] = useState<string>('');
  const { createRoute } = useCreateRoute();

  const handleCloseActPanel = (event: MouseEvent) => {
    if (
      actPanelRef.current &&
      !actPanelRef.current.contains(event.target as Node)
    )
      setAct(null);
  };

  const handleClickActBtn = () => {
    if ((inp === '' || inp.includes('/')) && act !== 'delete') return;

    if (act === 'add') {
      createRoute(`${route}/${inp}`);
    }

    if (act === 'rename') {
    }

    if (act === 'delete') {
    }

    setAct(null);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleCloseActPanel);

    return () => {
      document.removeEventListener('mousedown', handleCloseActPanel);
    };
  }, []);

  const {
    isLoading,
    isFetching,
    isError,
    data: childRoutes,
  } = useChildRoutes(route);

  return (
    <div className='group w-full flex flex-col justify-between items-start shadow-md rounded-md'>
      <div
        className={`w-full bg-indigo-200 p-2 text-sm font-medium text-gray-500 flex justify-between rounded-md ${
          childRoutes?.length && act === null
            ? 'group-hover:rounded-b-none'
            : ''
        }`}
      >
        <div className='flex justify-start space-x-4'>
          {segments.map((seg, i) => {
            const last = i === segments.length - 1;
            return (
              <React.Fragment key={i}>
                <Link
                  href={segments.slice(0, i + 1).join('/')}
                  className={`inline-block ${
                    last ? 'text-indigo-600' : 'hover:text-indigo-800 '
                  }`}
                >
                  {seg}
                </Link>

                {!last && <span className='text-gray-400'>{'>'}</span>}
              </React.Fragment>
            );
          })}
        </div>
        <div className='relative' ref={actPanelRef}>
          <div className='flex justify-end space-x-2'>
            <PlusSolidIcon
              className={`w-5 h-5 ${
                act === 'add' ? 'text-emerald-500' : 'text-gray-400'
              } hover:text-emerald-500`}
              onClick={() => setAct('add')}
            />
            <PencilSolidIcon
              className={`w-5 h-5 ${
                act === 'rename' ? 'text-indigo-500' : 'text-gray-400'
              } hover:text-indigo-500`}
              onClick={() => setAct('rename')}
            />
            <TrashSolidIcon
              className={`w-5 h-5 ${
                act === 'delete' ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-500`}
              onClick={() => setAct('delete')}
            />
          </div>
          {act !== null && (
            <div className='absolute top-[30px] -right-2 shadow-lg max-w-fit h-12 rounded-md flex flex-col justify-center items-end bg-indigo-200 overflow-clip'>
              <div className='min-w-fit p-2 flex justify-between space-x-4'>
                {act !== 'delete' && (
                  <input
                    type='text'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none h-9'
                    onChange={(e) => setInp(e.target.value)}
                  />
                )}
                <button
                  type='button'
                  className={`rounded ${
                    act === 'add'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : act === 'rename'
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : 'bg-red-600 hover:bg-red-500'
                  } px-8 py-2 w-[112px] h-9 text-xs font-semibold text-white shadow-sm  focus:outline-none`}
                  onClick={handleClickActBtn}
                >
                  {act.charAt(0).toUpperCase() + act.slice(1)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {act === null && !isLoading && !isFetching && (
        <div
          className={`w-full h-full px-2 ${
            childRoutes?.length ? 'py-2' : ''
          } text-sm font-medium hidden group-hover:flex justify-start space-x-4 rounded-b-md`}
        >
          {childRoutes?.map((childRoute, i) => (
            <Link
              href={childRoute.route}
              key={i}
              className='inline-block px-6 py-2 text-gray-500 hover:text-indigo-800 hover:bg-indigo-200 rounded-lg'
            >
              {childRoute.route.split('/').pop()}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabBar;
