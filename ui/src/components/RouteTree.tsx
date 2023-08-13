import React, { useState, useRef, useEffect } from 'react';
import {
  PlusSolidIcon,
  MinusSolidIcon,
  PlusCircleSolidIcon,
  PencilSolidIcon,
  TrashSolidIcon,
  CheckCircleSolidIcon,
  SpinnerSolidIcon,
  WarningOutlineIcon,
} from '@/components/Icons';
import { ModalProps, Modal } from '@/components/Modal';
import { useCreateRoute, getParentPath } from '@/hooks/useCreateRoute';
import { useRouteTree } from '@/hooks/useRouteTree';
import { useRenameRoute } from '@/hooks/useRenameRoute';
import { useDeleteRoute } from '@/hooks/useDeleteRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface RouteNode {
  route: string;
  children: RouteNode[] | null;
}

enum Mode {
  DEFAULT = 'default',
  ADD = 'add',
  EDIT = 'edit',
}

const RouteTreeNode = ({
  data,
  openModal,
}: {
  data: RouteNode;
  openModal: Function;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState<Mode>(Mode.DEFAULT);

  const editRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const [editInp, setEditInp] = useState<string>(data.route);
  const [addInp, setAddInp] = useState<string>('');

  const { createRoute } = useCreateRoute();
  const { renameRoute } = useRenameRoute();
  const { deleteRoute } = useDeleteRoute();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleReturnToDefault = (event: MouseEvent) => {
    if (
      editRef.current &&
      !editRef.current.contains(event.target as Node) &&
      !(addRef.current && addRef.current.contains(event.target as Node))
    )
      setMode(Mode.DEFAULT);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleReturnToDefault);

    return () => {
      document.removeEventListener('mouseup', handleReturnToDefault);
    };
  }, []);

  const route = data.route.split('/').slice(-1)[0];
  const path = usePathname();

  useEffect(() => {
    setMode(Mode.DEFAULT);
  }, [route, data.children]);

  return (
    <div className='pl-3'>
      <div className='group select-none mt-2 flex items-center'>
        <div className='w-3 inline-block'>
          {data.children ? (
            isOpen ? (
              <MinusSolidIcon
                className='w-3 h-3 cursor-pointer'
                onClick={handleToggle}
              />
            ) : (
              <PlusSolidIcon
                className='w-3 h-3 cursor-pointer'
                onClick={handleToggle}
              />
            )
          ) : mode === Mode.ADD ? (
            <MinusSolidIcon
              className='w-3 h-3 cursor-pointer'
              onClick={handleToggle}
            />
          ) : (
            ' '
          )}
        </div>
        <div
          ref={editRef}
          className='flex justify-between items-center ml-2 space-x-4'
        >
          {mode === Mode.EDIT ? (
            <div className='flex justify-between items-center'>
              <input
                placeholder={route}
                className='w-full rounded-none rounded-l-md border-0 shadow-sm px-2 -translate-x-2 ring-1 ring-inset ring-gray-300 focus:outline-none'
                onChange={(e) => setEditInp(e.target.value || route)}
              />
              <button
                className='bg-green-600 -translate-x-2 px-3 rounded-r-md'
                onClick={() => {
                  if (editInp === '' || editInp.includes('/')) return;
                  const newRoute = `${getParentPath(data.route)}/${editInp}`;
                  renameRoute(data.route, newRoute);
                }}
              >
                <CheckCircleSolidIcon className='w-4 text-white' />
              </button>
            </div>
          ) : (
            <>
              <Link
                href={data.route}
                className={`${
                  path === data.route ? 'text-indigo-600' : ''
                } hover:underline hover:underline-offset-[5px] hover:cursor-pointer decoration-indigo-400`}
              >
                {route}
              </Link>
              <div className='hidden group-hover:flex justify-center space-x-1 text-gray-400 '>
                <PlusCircleSolidIcon
                  className='w-4 h-4 hover:text-emerald-600'
                  onClick={() => setMode(Mode.ADD)}
                />
                {data.route !== '/formulas' && (
                  <>
                    <PencilSolidIcon
                      className='w-4 h-4 hover:text-indigo-600'
                      onClick={() => setMode(Mode.EDIT)}
                    />
                    <TrashSolidIcon
                      className='w-4 h-4 hover:text-red-600'
                      onClick={() =>
                        openModal({
                          type: 'warning',
                          title: 'Confirm',
                          body: 'Are you sure you want to delete this route and its children?',
                          yesCallback: () => deleteRoute(data.route),
                        })
                      }
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {data.children && (
        <div className={`${isOpen ? '' : 'hidden'} pl-3`}>
          {data.children.map((child, index) => (
            <RouteTreeNode key={index} data={child} openModal={openModal} />
          ))}
        </div>
      )}
      {mode === Mode.ADD && (
        <div className='pl-6' ref={addRef}>
          <div className='mt-2 ml-5 flex justify-between items-center'>
            <input
              placeholder=''
              className='w-full rounded-none rounded-l-md border-0 shadow-sm px-2 -translate-x-2 ring-1 ring-inset ring-gray-300 focus:outline-none'
              onChange={(e) => setAddInp(e.target.value)}
            />
            <button
              className='bg-green-600 -translate-x-2 px-3 rounded-r-md'
              onClick={() => {
                if (
                  addInp === '' ||
                  addInp.includes('/') ||
                  addInp.includes(' ')
                )
                  return;
                const childRoute = `${data.route}/${addInp}`;
                createRoute(childRoute);
              }}
            >
              <CheckCircleSolidIcon className='w-4 text-white' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RouteTree = () => {
  const [modalConfig, setModalConfig] = useState<ModalProps>({
    title: '',
    body: '',
    open: false,
    setOpen: (open: boolean) => setModalConfig({ ...modalConfig, open }),
    yesCallback: () => {},
  });

  const openModal = (cfg: {
    title?: string;
    body?: string;
    yesCallback?: Function;
    confirmAlias?: string;
    type?: 'warning' | 'success' | 'error' | 'default';
    canCancel?: boolean;
    canConfirm?: boolean;
  }) => {
    const cfg_ = { ...modalConfig, ...cfg };
    setModalConfig({
      ...cfg_,
      open: true,
      setOpen: (open: boolean) => setModalConfig({ ...cfg_, open }),
    });
  };

  const { isLoading, data, isError } = useRouteTree();

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
          Failed to retrieve route tree
        </span>
      </div>
    );

  return (
    <>
      <div className='flex justify-start'>
        <RouteTreeNode data={data} openModal={openModal} />
      </div>
      <Modal {...modalConfig} />
    </>
  );
};

export default RouteTree;
