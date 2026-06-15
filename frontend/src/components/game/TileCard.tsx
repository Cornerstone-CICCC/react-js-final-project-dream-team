import type { Tile } from '../../context/game/GameContext';

const TILE_COLORS: Record<string, { text: string; dot: string }> = {
  red: { text: '#ea4d1c', dot: '#ea4d1c' },
  blue: { text: '#2563EB', dot: '#2563EB' },
  black: { text: '#1a1c1c', dot: '#1a1c1c' },
  yellow: { text: '#BA7517', dot: '#BA7517' },
};

interface TileCardProps {
  tile: Tile;
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
}

const TileCard = ({ tile, isSelected, isDragging, onClick }: TileCardProps) => {
  const colors = TILE_COLORS[tile.color];
  return (
    <div
      onClick={onClick}
      style={{ borderColor: isSelected ? '#ea4d1c' : '#E0E0E' }}
      className={`w-12 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border-2 select-none transition-all cursor-grab shadow-[0_2px_6px_rgba(0,0,0,0.08),0_1px_0_#DADADA] ${isSelected ? 'scale-105 shadow-[0_0_0_3px_#ea4d1c]' : 'hover:scale-105'} ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <span
        style={{ color: colors.text }}
        className="text-base font-bold leading-none"
      >
        {tile.number}
      </span>
      <span
        style={{ background: colors.text }}
        className="w-1.5 h-1.5 rounded-full mt-1"
      />
    </div>
  );
};

export default TileCard;
