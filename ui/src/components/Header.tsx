import React from 'react';
import Link from 'next/link';
import {
  HomeSolidIcon,
  GithubSolidIcon,
  ZitySpaceSolidIcon,
} from '@/components/Icons';

const Header = () => {
  return (
    <div className='bg-indigo-600 max-w-screen-2xl mx-auto px-4 fixed w-full z-20'>
      <div className='flex items-center justify-between h-12'>
        <div className='h-8 w-8 relative'>
          <Link href='/'>
            <HomeSolidIcon className='w-full h-full text-indigo-100' />
          </Link>
        </div>
        <div className='flex space-x-2'>
          <div className='h-8 w-8 relative'>
            <Link href='https://github.com/ZitySpace/zlens' target='_blank'>
              <GithubSolidIcon className='w-full h-full text-indigo-100' />
            </Link>
          </div>
          <div className='h-8 w-8 relative'>
            <Link href='https://zityspace.com' target='_blank'>
              <ZitySpaceSolidIcon className='w-full h-full text-indigo-100' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
