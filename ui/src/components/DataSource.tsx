'use client';

import React, { useState } from 'react';
import { CogOutlineIcon } from './Icons';

const DataSource = () => {
  const [open, setOpen] = useState(false);
  const [srcType, setSrcType] = useState('local');

  return (
    <div className='w-full border rounded-t-lg'>
      <div className='w-full bg-gray-200 px-4 py-1 flex justify-between items-center rounded-t-lg'>
        <span className='text-gray-500 font-semibold'>Data source</span>

        <div
          className={`p-1 cursor-pointer rounded-full ${
            open ? 'bg-gray-50' : ''
          }`}
          onClick={() => setOpen(!open)}
        >
          <div className='h-6 w-6 relative'>
            <CogOutlineIcon
              className={`w-full h-full ${
                open ? 'text-gray-600' : 'text-gray-500 hover:text-gray-600'
              }`}
            />
          </div>
        </div>
      </div>

      {open && (
        <div className='w-full px-4 py-2 border-b'>
          <div className='flex space-x-4'>
            <button
              type='button'
              className={`rounded w-20 py-1 text-sm font-semibold shadow-sm ${
                srcType === 'local'
                  ? 'bg-indigo-600 text-white '
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
              onClick={() => setSrcType('local')}
            >
              Local
            </button>
            <button
              type='button'
              className={`rounded w-20 py-1 text-sm font-semibold shadow-sm ${
                srcType === 's3'
                  ? 'bg-indigo-600 text-white '
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
              onClick={() => setSrcType('s3')}
            >
              S3
            </button>
          </div>
        </div>
      )}

      <div className='w-full px-4 pt-2 pb-4 flex justify-between'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium leading-6 text-gray-900'
          >
            Name
          </label>
          <div className='relative mt-2'>
            <input
              type='text'
              name='name'
              id='name'
              className='peer block w-full border-0 bg-gray-50 py-1.5 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6'
              placeholder='Jane Smith'
            />
            <div
              className='absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600'
              aria-hidden='true'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSource;
