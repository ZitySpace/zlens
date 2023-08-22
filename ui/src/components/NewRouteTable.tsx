import React, { useState } from 'react';

import {
  PlusCircleSolidIcon,
  SpinnerSolidIcon,
  WarningOutlineIcon,
} from '@/components/Icons';
import { useRouteTree } from '@/hooks/useRouteTree';
import { useCreateRouteAndSyncInstances } from '@/hooks/useCreateRouteAndSyncInstances';

const NewRouteTable = () => {
  const [route, setRoute] = useState<string>('');
  const createRouteAndSyncInstances = useCreateRouteAndSyncInstances();

  const addNewRoute = () => {
    if (
      route === '' ||
      route.startsWith('/') ||
      route.includes(' ') ||
      !flattenRoutes(data, `/formulas/${route}`).includes(`/formulas/${route}`)
    )
      return;

    createRouteAndSyncInstances(`/formulas/${route}`);
  };

  const { isLoading, data, isError } = useRouteTree();

  const flattenRoutes = (tree: any, path: string) => {
    const routes: string[] = [];

    const helper = (node: any, path: string) => {
      if (node) {
        if (node.route.startsWith(path)) {
          routes.push(node.route);
        } else if (!path.startsWith(node.route)) return;

        if (node.children) {
          for (const child of node.children) {
            helper(child, path);
          }
        }
      }
    };

    helper(tree, path);
    return routes;
  };

  return (
    <div className='flex flex-col justify-center items-start space-y-2'>
      <div className='w-full flex rounded-md shadow-sm'>
        <div className='relative flex flex-grow items-stretch focus-within:z-10'>
          <div className='pointer-events-none absolute inset-y-0.5 left-0.5 flex items-center pl-3 pr-1 bg-gray-200 text-gray-500 rounded-l-md'>
            /formulas/
          </div>
          <input
            type='text'
            name='route'
            id='route'
            className='block w-full rounded-none rounded-l-md border-0 py-1.5 pl-[104px] text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6'
            placeholder=''
            onChange={(e) => {
              const val = e.target.value;
              const r = val.endsWith('/') ? val.slice(0, -1) : val;
              setRoute(r);
            }}
          />
        </div>
        <button
          type='button'
          className='relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          onClick={addNewRoute}
        >
          <PlusCircleSolidIcon
            className='-ml-0.5 h-5 w-5 text-gray-400'
            aria-hidden='true'
          />
          New
        </button>
      </div>

      <div className='w-full bg-gray-200 min-h-64 pl-[14px] py-2'>
        {isLoading ? (
          <div className='h-full w-full flex justify-center items-center text-indigo-400'>
            <SpinnerSolidIcon className='h-8 w-8' />
          </div>
        ) : isError ? (
          <div className='h-full w-full flex flex-col justify-center items-center space-y-2 text-red-400'>
            <WarningOutlineIcon className='h-12 w-12' />
            <span className='text-sm text-gray-600'>
              Failed to retrieve routes
            </span>
          </div>
        ) : (
          <div className='flex flex-col justify-center items-start space-y-2 text-gray-500'>
            {flattenRoutes(data, `/formulas/${route}`).map((route, i) => (
              <span key={i}>{route}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRouteTable;
