import React, { useContext } from 'react';
import { PlusSolidIcon } from './Icons';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';

const data = [
  {
    id: 1,
    title: 'Category distribution',
    description:
      'A quick visual summary of how the data is distributed across the categories in the dataset. It can reveal imbalances or other patterns in the data that may be useful to know for training machine learning models.',
  },
  {
    id: 2,
    title: 'Size distribution',
    description:
      'Image size distribution and box size distribution help detecting erratic images and annotations in the dataset.',
  },
  {
    id: 3,
    title: 'Annotation tracker',
    description:
      'Manage annotation progress and discover quality issues as early as possible.',
  },
  {
    id: 4,
    title: 'Hirarchical category treeview',
    description:
      'Using tree / treemap representation to understand and navigate category taxonomy, discover imbalance issue in the dataset.',
  },
];

const List = () => {
  const formulaStore = useContext(FormulaStoreContext);
  const install = useStore(formulaStore, (s) => s.actions.install);

  return (
    <div className='max-h-full w-full overflow-y-auto scroll-smooth pb-16'>
      <div className='flex flex-col space-y-4'>
        {data.map((d, i) => (
          <div
            key={i}
            className='w-full border h-36 bg-gray-50 rounded-lg pt-4 pb-2 px-4 flex flex-col justify-between items-start divide-y divide-gray-200'
          >
            <div className='w-full flex flex-col justify-start items-start space-y-2'>
              <span className='text-sm font-normal text-gray-600'>
                {d.title}
              </span>
              <span className='text-xs font-normal text-gray-500 '>
                {d.description.length > 120
                  ? d.description.slice(0, 120) + '...'
                  : d.description}
              </span>
            </div>
            <div className='w-full flex justify-between items-center pt-2'>
              <div className='flex space-x-1 items-center'>
                <span className='rounded-full bg-indigo-500 h-1 w-1' />
                <span className='rounded-full bg-indigo-500 h-1 w-1' />
                <span className='rounded-full bg-indigo-500 h-1 w-1' />
              </div>

              <button
                type='button'
                className='inline-flex items-center gap-x-1.5 rounded-sm bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-500'
                onClick={() => install(d)}
              >
                <PlusSolidIcon className='-ml-0.5 h-4 w-4' />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
