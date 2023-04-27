import { PlusSolidIcon } from './Icons';
import { SpinnerSolidIcon } from './Icons';
import { useInstalledFormulas } from '@/hooks/useInstalledFormulas';
import { useCreateInstance } from '@/hooks/useCreateInstance';

const List = () => {
  const {
    isLoading,
    isFetching,
    data: installedFormulas,
  } = useInstalledFormulas();

  const createInstance = useCreateInstance();

  if (isLoading || isFetching)
    return (
      <div className='h-full w-full flex justify-center items-center text-indigo-400'>
        <SpinnerSolidIcon className='h-8 w-8' />
      </div>
    );

  return (
    <div className='max-h-full w-full overflow-y-auto scroll-smooth pb-16'>
      <div className='flex flex-col space-y-4'>
        {installedFormulas!.map((d, i) => (
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
                onClick={() => createInstance(d)}
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
