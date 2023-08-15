import React from 'react';
import { useServices } from '@/hooks/useServices';
import {
  SpinnerSolidIcon,
  WarningOutlineIcon,
  PlaySolidIcon,
  StopSolidIcon,
} from '@/components/Icons';
import { RouteStoreContext } from '@/stores/RouteStore';
import { useContext } from 'react';
import { useStore } from 'zustand';
import Link from 'next/link';
import { tryAPIUrl } from '@/utils/requestTemplate';
import { useKillService } from '@/hooks/useKillService';
import { useStartService } from '@/hooks/useStartService';

const FormulaServiceTable = () => {
  const { isLoading, data, isError } = useServices();

  const RouteStore = useContext(RouteStoreContext);
  const formulaMap = useStore(RouteStore, (s) => s.formulaMap);

  const { killService } = useKillService();
  const { startService } = useStartService();

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
          Failed to retrieve formula services
        </span>
      </div>
    );

  const localFormulaInstances = Object.entries(formulaMap).reduce<{
    [key: string]: { route: string; instanceId: string | number }[];
  }>((res, [route, store]) => {
    const instances = store.getState().instances;

    instances.map((ins) => {
      const instanceId = ins.instanceId!;
      const slug = ins.slug;

      res[slug] = [...(res[slug] || []), { route, instanceId }];
    });

    return res;
  }, {});

  const data_ = data.reduce<typeof data>((res, formula) => {
    const group_local =
      formula.slug in localFormulaInstances
        ? localFormulaInstances[formula.slug].reduce<{
            [key: string]: (string | number)[];
          }>(
            (res, e) => ({
              ...res,
              [e.route]: [...(res[e.route] || []), e.instanceId],
            }),
            {}
          )
        : {};

    const group_remote = formula.services.reduce<{
      [key: string]: (string | number)[];
    }>(
      (res, e) => ({
        ...res,
        [e.route]: [...(res[e.route] || []), e.instanceId],
      }),
      {}
    );

    const group = [];

    for (const [route, instances] of Object.entries(group_local)) {
      const routeInRemote = route in group_remote;
      for (const instanceId of instances) {
        if (routeInRemote) {
          const instanceInRemote = group_remote[route].includes(instanceId);
          if (instanceInRemote) {
            group.push({ route, instanceId, status: 'default' });
            group_remote[route].splice(
              group_remote[route].indexOf(instanceId),
              1
            );
          } else {
            group.push({ route, instanceId, status: 'new' });
          }
        } else {
          group.push({ route, instanceId, status: 'new' });
        }
      }
    }

    for (const [route, instances] of Object.entries(group_remote)) {
      for (const instanceId of instances) {
        group.push({
          route,
          instanceId,
          status: route in formulaMap ? 'deleted' : 'default',
        });
      }
    }

    return [...res, { ...formula, services: group }];
  }, []);

  return (
    <div className='flex justify-start'>
      <div className='max-h-full w-full overflow-y-auto scroll-smooth rounded-lg border'>
        <table className='min-w-full divide-y divide-gray-200 table-fixed'>
          <thead className='bg-gray-200'>
            <tr className='text-left text-sm font-normal text-gray-500 divide-x divide-gray-100'>
              <th className='px-4 py-1'>Instance id</th>
              <th className='px-4'>Sub route</th>
              <th className='px-4'>Formula slug</th>
              <th className='px-4'>Port</th>
              <th className='px-4'>API</th>
              <th className='px-4'>Time</th>
              <th className='px-2 text-center'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {data_.map((formula) => {
              const instances = formula.services;
              const slug = formula.slug;

              if (instances.length === 0)
                return (
                  <tr
                    key={formula.id}
                    className='text-sm text-gray-600 divide-x divide-gray-100'
                  >
                    <td className='px-4 py-2'>-</td>
                    <td className='px-4 py-2'>-</td>
                    <td className='px-4 py-2'>{formula.slug}</td>
                    {formula.serving ? (
                      <>
                        <td className='px-4 py-2'>
                          {formula.endpoint.split(':').slice(-1)[0]}
                        </td>
                        <td className='px-4 py-2'>
                          <Link
                            href={tryAPIUrl('/' + formula.docs)}
                            className='hover:underline hover:underline-offset-[5px] hover:cursor-pointer decoration-indigo-400'
                            target='_black'
                            rel='noopener noreferrer'
                          >
                            docs
                          </Link>
                        </td>
                        <td className='px-4 py-2'>
                          {formula.served_at.replace('T', ' ')}
                        </td>

                        <td className='px-2 py-2'>
                          <div className='flex justify-center w-full'>
                            <StopSolidIcon
                              className='text-red-400 w-7 h-7 hover:cursor-pointer'
                              onClick={() => {
                                killService(
                                  '/' + formula.docs.replace('/docs', '')
                                );
                              }}
                            />
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className='px-4 py-2'>-</td>
                        <td className='px-4 py-2'>-</td>
                        <td className='px-4 py-2'>-</td>
                        <td className='px-2 py-2'>
                          <div className='flex justify-center w-full'>
                            <PlaySolidIcon
                              className='text-green-400 w-7 h-7 hover:cursor-pointer'
                              onClick={() =>
                                startService(formula.id.toString())
                              }
                            />
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );

              return instances.map((ins, i) => (
                <tr
                  key={ins.instanceId}
                  className='text-sm text-gray-600 divide-x divide-gray-100'
                >
                  <td
                    className={`px-4 py-2 ${
                      ins.status === 'new'
                        ? 'bg-green-100'
                        : ins.status === 'deleted'
                        ? 'bg-red-100'
                        : 'bg-indigo-100'
                    }`}
                  >
                    {ins.instanceId}
                  </td>
                  <td className='px-4 py-2'>{ins.route}</td>
                  {i === 0 && (
                    <>
                      <td rowSpan={instances.length} className='px-4 py-2'>
                        {formula.slug}
                      </td>

                      {formula.serving ? (
                        <>
                          <td rowSpan={instances.length} className='px-4 py-2'>
                            {formula.endpoint.split(':').slice(-1)[0]}
                          </td>
                          <td rowSpan={instances.length} className='px-4 py-2'>
                            <Link
                              href={tryAPIUrl('/' + formula.docs)}
                              className='hover:underline hover:underline-offset-[5px] hover:cursor-pointer decoration-indigo-400'
                              target='_black'
                              rel='noopener noreferrer'
                            >
                              docs
                            </Link>
                          </td>

                          <td rowSpan={instances.length} className='px-4 py-2'>
                            {formula.served_at.replace('T', ' ')}
                          </td>

                          <td rowSpan={instances.length} className='px-2 py-2'>
                            <div className='flex justify-center w-full'>
                              <StopSolidIcon
                                className='text-red-400 w-7 h-7 hover:cursor-pointer'
                                onClick={() => {
                                  killService(
                                    '/' + formula.docs.replace('/docs', '')
                                  );
                                }}
                              />
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td rowSpan={instances.length} className='px-4 py-2'>
                            -
                          </td>
                          <td rowSpan={instances.length} className='px-4 py-2'>
                            -
                          </td>
                          <td rowSpan={instances.length} className='px-4 py-2'>
                            -
                          </td>
                          <td rowSpan={instances.length} className='px-2 py-2'>
                            <div className='flex justify-center w-full'>
                              <PlaySolidIcon
                                className='text-green-400 w-7 h-7 hover:cursor-pointer'
                                onClick={() =>
                                  startService(formula.id.toString())
                                }
                              />
                            </div>
                          </td>
                        </>
                      )}
                    </>
                  )}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormulaServiceTable;
