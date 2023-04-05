import React, { ReactNode, useState, useRef, useContext } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  VDragSolidIcon,
  EyeSolidIcon,
  EyeHideSolidIcon,
  TrashSolidIcon,
} from './Icons';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { useStore } from 'zustand';

type DraggableRowProps = {
  id: string | number;
  index: number;
  moveRow: (fromIndex: number, toIndex: number) => void;
  children: ReactNode;
  selectedId: string | number | null;
  setSelectedId: (id: string | number | null) => void;
};

const DraggableRow: React.FC<DraggableRowProps> = ({
  id,
  index,
  moveRow,
  children,
  selectedId,
  setSelectedId,
}) => {
  const dropRef = useRef<HTMLTableRowElement>(null);
  const dragRef = useRef<HTMLTableCellElement>(null);

  const [, drop] = useDrop({
    accept: 'row',
    hover: (item: { id: string | number; index: number }, monitor) => {
      if (!dropRef.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset
        ? clientOffset.y - hoverBoundingRect.top
        : 0;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'row',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const selected = selectedId === id;

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <tr
      ref={dropRef}
      className={`${isDragging ? 'opacity-75 shadow-lg' : ''} ${
        selected ? 'bg-indigo-100' : ''
      }`}
      onMouseDown={() => setSelectedId(id)}
    >
      <td ref={dragRef} className='px-4 w-12 cursor-pointer'>
        <VDragSolidIcon
          className={`w-4 h-4 ${
            selected ? 'text-indigo-400' : 'text-gray-400'
          }`}
        />
      </td>
      {children}
    </tr>
  );
};

const Table = () => {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const formulaStore = useContext(FormulaStoreContext);
  const [installed, swap, toggleVisble, uninstall] = useStore(
    formulaStore,
    (s) => [
      s.installed,
      s.actions.swap,
      s.actions.toggleVisble,
      s.actions.uninstall,
    ]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='max-h-full w-full overflow-y-auto scroll-smooth rounded-lg border'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-200'>
            <tr>
              <th className='w-12'></th>
              <th className='w-8'></th>
              <th className='px-4 py-2 text-left text-xs font-normal text-gray-500'>
                Formulas
              </th>
              <th className='w-8'></th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {installed.map((formula, index) => (
              <DraggableRow
                key={formula.instanceId!}
                id={formula.instanceId!}
                index={index}
                moveRow={swap}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
              >
                <td className='px-2 w-8'>
                  {formula.visible ? (
                    <EyeSolidIcon
                      className={`w-4 h-4 ${
                        selectedId === formula.instanceId
                          ? 'text-emerald-400'
                          : 'text-gray-400'
                      }`}
                      onClick={() => toggleVisble(formula.instanceId!)}
                    />
                  ) : (
                    <EyeHideSolidIcon
                      className={`w-4 h-4 ${
                        selectedId === formula.instanceId
                          ? 'text-emerald-400'
                          : 'text-gray-400'
                      }`}
                      onClick={() => toggleVisble(formula.instanceId!)}
                    />
                  )}
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  <div className='text-xs text-gray-500'>{formula.title}</div>
                </td>
                <td className='px-4 w-8'>
                  <div
                    className={`${
                      selectedId === formula.instanceId ? '' : 'hidden'
                    }`}
                  >
                    <TrashSolidIcon
                      className='w-4 h-4 text-red-400'
                      onClick={() => uninstall(formula.instanceId!)}
                    />
                  </div>
                </td>
              </DraggableRow>
            ))}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default Table;
