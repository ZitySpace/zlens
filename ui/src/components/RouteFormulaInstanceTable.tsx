import React, { useState } from 'react';
import { useRoutesInstances } from '@/hooks/useRoutesInstances';
import { SpinnerSolidIcon, WarningOutlineIcon } from '@/components/Icons';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import { Formula } from '@/interfaces';
import { Switch } from '@headlessui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const RouteFormulaInstanceTable = () => {
  const { isLoading, data, isError } = useRoutesInstances();

  const RouteStore = useContext(RouteStoreContext);
  const formulaMap = useStore(RouteStore, (s) => s.formulaMap);

  const [hasInstance, setHasInstance] = useState<boolean>(false);

  const path = usePathname();

  if (isLoading)
    return (
      <div className='h-full w-full flex justify-center items-center text-indigo-400'>
        <SpinnerSolidIcon className='h-8 w-8' />
      </div>
    );

  if (isError)
    return (
      <div className='h-full w-full flex flex-col justify-center items-center space-y-2 text-red-400'>
        <WarningOutlineIcon className='h-12 w-12' />
        <span className='text-sm text-gray-600'>
          Failed to retrieve routes and corresponding formulas
        </span>
      </div>
    );

  const routeInstances: { [key: string]: Formula[] } = Object.entries(
    data
  ).reduce((res, [route, instances]) => {
    const instances_ =
      route in formulaMap ? formulaMap[route].getState().instances : instances;
    return { ...res, [route]: instances_ };
  }, {});

  return (
    <div className='flex justify-start'>
      <div className='max-h-full w-full overflow-y-auto scroll-smooth rounded-lg border'>
        <table className='min-w-full divide-y divide-gray-200 table-fixed'>
          <thead className='bg-gray-200'>
            <tr className='text-left text-sm font-normal text-gray-500'>
              <th className='pl-4 py-1 w-1/2'>Sub-route</th>
              <th className='pr-4 py-1 flex justify-between items-center'>
                <span>Formulas</span>

                <Switch
                  checked={hasInstance}
                  onChange={setHasInstance}
                  className={`${
                    hasInstance ? 'bg-indigo-600' : 'bg-gray-400'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none `}
                >
                  <span className='sr-only'>Instance filter</span>
                  <span
                    aria-hidden='true'
                    className={`${
                      hasInstance ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </th>
            </tr>
          </thead>

          <tbody className='bg-white divide-y divide-gray-200'>
            {Object.entries(routeInstances).map(([route, formulas]) => {
              if (hasInstance && formulas.length === 0) return null;

              return (
                <tr key={route} className='text-gray-500 even:bg-gray-50'>
                  <td className='py-2 px-4 whitespace-nowrap'>
                    {/* <span className='text-sm font-medium text-gray-900'>
                      {route}
                    </span> */}
                    <Link
                      href={route}
                      className={`${
                        path === route ? 'text-indigo-600' : ''
                      } text-sm font-medium text-gray-900 hover:underline hover:underline-offset-[5px] hover:cursor-pointer decoration-indigo-400`}
                    >
                      {route}
                    </Link>
                  </td>
                  <td className='py-2 whitespace-nowrap'>
                    <div className='flex flex-col space-y-2'>
                      {formulas.map((formula) => (
                        <div
                          key={formula.instanceId}
                          className='flex justify-start items-center space-x-2 font-mono'
                        >
                          <span className='text-sm text-gray-600'>
                            {formula.instanceId}
                          </span>
                          <span className='h-1 w-1 bg-gray-400 rounded-full'></span>
                          <span className='text-sm text-gray-600'>
                            {formula.slug}
                          </span>
                          <span className='h-1 w-1 bg-gray-400 rounded-full'></span>
                          <span className='text-sm text-gray-600'>
                            {formula.version}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RouteFormulaInstanceTable;
