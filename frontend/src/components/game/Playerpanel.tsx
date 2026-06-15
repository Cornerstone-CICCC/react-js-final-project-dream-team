import type { Player } from '../../context/game/GameContext';

interface PlayerPanelProps {
  players: Player[];
  currentTurn: string;
  currentUserId: string;
}

const Playerpanel = ({
  players,
  currentTurn,
  currentUserId,
}: PlayerPanelProps) => {
  return (
    <div className="flex items-center justify-center gap-8 py-4 border-b border-[#E2E2E2]">
      {players.map((player) => {
        const isActive = player.id === currentTurn;
        const isMe = player.id === currentUserId;

        return (
          <div key={player.id} className="flex flex-col items-center gap-1">
            <div
              className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-[#E2E2E2] ${isActive ? 'ring-4 ring-[#1a1c1c]' : 'ring-2 ring-[#E2E2E2]'}`}
            >
              <span className="text-lg font-bold text-[#444748]">
                {player.username.charAt(0).toUpperCase()}
              </span>

              {/* Tile Count Badge */}

              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1a1c1c] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {player.tileCount}
              </span>

              {isActive && (
                <span className="absolute -bottom-5 text-[10px] font-bold text-[#1a1c1c] tracking-widest">
                  TURN
                </span>
              )}
            </div>

            <p className="text-xs text-[#444748] mt-4">
              {isMe ? 'You' : player.username}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Playerpanel;
