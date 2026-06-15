import { useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import TileCard from './TileCard';
import type { Tile } from '../../context/game/GameContext';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import { MdNavigateNext } from 'react-icons/md';
import { IoDownloadOutline } from 'react-icons/io5';

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
  onDrawTile: () => void;
  onReturn: () => void;
  onEndTurn: () => void;
  currentTurnLabel: string;
}

const Rack = ({
  rack,
  selectedTile,
  isMyTurn,
  onSelectTile,
  onDeclare,
  onDrawTile,
  onReturn,
  onEndTurn,
  currentTurnLabel,
}: RackProps) => {
  const rackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    rackRef.current?.scrollTo({ left: rackRef.current.scrollWidth, behavior: 'smooth' });
  }, [rack.length]);

  return (
    <div className="border-t border-[#E2E2E2] bg-[#EBE3D5] px-6 py-6 shrink-0">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[#8E8576] uppercase">
          {currentTurnLabel}
        </div>

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
          onClick={onDrawTile}
          disabled={!isMyTurn}
          className="flex items-center gap-2 px-5 py-3 border-2 border-[#1a1c1c] text-[#1a1c1c] text-sm font-bold rounded-full hover:bg-[#F3F3F4] transition-all disabled:opacity-40"
        >
          <IoDownloadOutline size={16} /> Draw Tile
        </button>

        <button
          onClick={onEndTurn}
          disabled={!isMyTurn}
          className="flex items-center gap-2 px-10 py-4 bg-[#1a1c1c] text-white text-base font-bold rounded-full hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          End Turn <MdNavigateNext size={18} />
        </button>
      </div>

      {/* Tiles */}
      <div ref={rackRef} className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
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
