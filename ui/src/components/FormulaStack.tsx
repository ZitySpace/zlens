import React, { ReactNode, useContext, useRef } from 'react';
import { FormulaStoreContext } from '@/stores/FormulaStore';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VDragSolidIcon } from './Icons';

type DraggableBlockProps = {
  index: number;
  instanceId: number | string;
  children: ReactNode;
};

const DraggableBlock: React.FC<DraggableBlockProps> = ({
  index,
  instanceId,
  children,
}) => {
  const formulaStore = useContext(FormulaStoreContext);
  const [selectedInstanceId, swap, select] = useStore(
    formulaStore,
    (s) => [s.selectedInstanceId, s.actions.swap, s.actions.select],
    shallow
  );

  const dropRef = useRef<HTMLTableRowElement>(null);
  const dragRef = useRef<HTMLTableCellElement>(null);

  const [, drop] = useDrop({
    accept: 'card',

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

      swap(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'card',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const selected = selectedInstanceId === instanceId;

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <div
      ref={dropRef}
      className={`relative rounded-lg ${
        isDragging ? 'opacity-75 shadow-lg' : ''
      }  ${selected ? 'shadow-xl' : ''}`}
      onMouseDown={() => select(index)}
    >
      <span ref={dragRef} className='absolute top-2 left-2 cursor-pointer'>
        <VDragSolidIcon
          className={`w-6 h-6 ${
            selected ? 'text-indigo-600' : 'text-gray-400'
          }`}
        />
      </span>
      {children}
    </div>
  );
};

const Stack = () => {
  const formulaStore = useContext(FormulaStoreContext);

  const installed = useStore(formulaStore, (state) => state.installed);

  return (
    <DndProvider backend={HTML5Backend}>
      <Flipper flipKey={installed.map((f) => f.instanceId).join('-')}>
        <div className='flex flex-col space-y-4'>
          {installed.map((formula, index) => (
            <Flipped key={formula.instanceId} flipId={formula.instanceId}>
              <div>
                <DraggableBlock index={index} instanceId={formula.instanceId!}>
                  <div className='h-36 w-full p-6 shadow-md rounded-lg bg-indigo-200 flex justify-center items-center'>
                    {formula.title}
                  </div>
                </DraggableBlock>
              </div>
            </Flipped>
          ))}
        </div>
      </Flipper>
    </DndProvider>
  );
};

export default Stack;
