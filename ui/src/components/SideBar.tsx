'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CogOutlineIcon,
  RectangleGroupOutlineIcon,
  ServerStackOutlineIcon,
  UserCircleOutlineIcon,
} from './Icons';

const SidebarItem = ({
  href,
  icon: Icon,
}: {
  href: string;
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}) => {
  const path = usePathname();
  const isActive = path.includes(href);

  return (
    <div className={`p-2 rounded-full ${isActive ? 'bg-indigo-100' : ''}`}>
      <div className='h-6 w-6 relative'>
        <Link href={href}>
          <Icon
            className={`w-full h-full ${
              isActive ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          />
        </Link>
      </div>
    </div>
  );
};

const SideBar = () => {
  return (
    <div className='bg-indigo-200 w-16 h-screen fixed flex flex-col justify-between items-center pt-[72px] pb-4 z-10'>
      <div className='flex flex-col space-y-6'>
        <SidebarItem href='/formulas' icon={RectangleGroupOutlineIcon} />
        <SidebarItem href='/services' icon={ServerStackOutlineIcon} />
      </div>
      <div className='flex flex-col space-y-6'>
        <SidebarItem href='/user' icon={UserCircleOutlineIcon} />
        <SidebarItem href='/settings' icon={CogOutlineIcon} />
      </div>
    </div>
  );
};

export default SideBar;
