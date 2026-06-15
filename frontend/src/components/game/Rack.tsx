import { useDraggable } from '@dnd-kit/core';
import TileCard from './TileCard';
import type { Tile } from '../../context/game/GameContext';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import { MdNavigateNext } from 'react-icons/md';

interface DraggableTileProps {
  tile: Tile;
  isSelected: boolean;
  onClick: () => void;
}

const DraggableTile = ({ tile, isSelected, onClick }: DraggableTileProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tile.id,
    data: { tile, source: 'rack' },
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <TileCard
        tile={tile}
        isSelected={isSelected}
        isDragging={isDragging}
        onClick={onClick}
      />
    </div>
  );
};

interface RackProps {
  rack: Tile[];
  selectedTile: string | null;
  isMyTurn: boolean;
  onSelectTile: (id: string | null) => void;
  onDeclare: () => void;
  onReturn: () => void;
  onEndTurn: () => void;
}

const Rack = ({
  rack,
  selectedTile,
  isMyTurn,
  onSelectTile,
  onDeclare,
  onReturn,
  onEndTurn,
}: RackProps) => {
  return (
    <div className="border-t border-[#E2E2E2] bg-[#EBE3D5] px-6 PY-4 shrink-0">
      {/* Action buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onReturn}
          disabled={!isMyTurn}
          className="flex items-center gap-2 text-sm text-[#444748] hover:text-[#1a1c1c] transition-colors disabled:opacity-40"
        >
          <BsArrowReturnLeft size={16} /> Return
        </button>

        <button
          onClick={onDeclare}
          disabled={!isMyTurn}
          className="flex items-center gap-2 px-8 py-3 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <FaCheck /> Declare
        </button>

        <button
          onClick={onEndTurn}
          disabled={!isMyTurn}
          className="flex items-center gap-2 text-sm text-[#444748] hover:text-[#1a1c1c] transition-colors disabled:opacity-40"
        >
          End Turn <MdNavigateNext size={16} />
        </button>
      </div>

      {/* Tiles */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {rack.map((tile) => (
          <DraggableTile
            key={tile.id}
            tile={tile}
            isSelected={selectedTile === tile.id}
            onClick={() =>
              onSelectTile(selectedTile === tile.id ? null : tile.id)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Rack;
