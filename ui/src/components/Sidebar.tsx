'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CogOutlineIcon, CollectionOutlineIcon } from './Icons';

const SidebarItem = ({
  href,
  icon: Icon,
}: {
  href: string;
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div className={`p-2 rounded-full ${isActive ? 'bg-indigo-100' : ''}`}>
      <div className='h-6 w-6 relative'>
        <Link href={href}>
          <Icon
            className={`w-full h-full ${
              isActive ? 'text-indigo-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          />
        </Link>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className='bg-indigo-200 w-16 h-screen fixed flex flex-col justify-between items-center pt-16 pb-4'>
      <SidebarItem href='/data' icon={CollectionOutlineIcon} />
      <SidebarItem href='/settings' icon={CogOutlineIcon} />
    </div>
  );
};

export default Sidebar;
