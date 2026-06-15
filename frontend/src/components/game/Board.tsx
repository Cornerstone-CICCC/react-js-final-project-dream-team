import { useDroppable } from '@dnd-kit/core';
import TileCard from './TileCard';
import type { TileGroup } from '../../context/game/GameContext';

interface BoardProps {
  board: TileGroup[];
}

const Board = ({ board }: BoardProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'board' });

  return (
    <div className="flex-1 p-4 overflow-auto">
      <p className="text-xs font-bold tracking-widest text-[#ADADAD] text-center mb-3">
        THE BOARD
      </p>

      <div
        ref={setNodeRef}
        className={`rounded-2xl p-4 min-h-75 transition-colors ${isOver ? 'bg-[#F0F0F0]' : 'bg-[#F3F3F4]'}`}
      >
        {board.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-65">
            <p className="text-sm text-[#ADADAD]">Drag tiles here to play</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {board.map((group, groupIndex) => (
              <div key={groupIndex} className="flex gap-1">
                {group.map((tile) => (
                  <TileCard key={tile.id} tile={tile} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
