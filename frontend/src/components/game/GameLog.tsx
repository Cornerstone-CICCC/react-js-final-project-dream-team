interface LogEntry {
  time: string;
  text: string;
}

interface GameLogProps {
  logs: LogEntry[];
  drawPileCount: number;
  isMyTurn: boolean;
  onDrawTile: () => void;
}

const GameLog = ({
  logs,
  drawPileCount,
  isMyTurn,
  onDrawTile,
}: GameLogProps) => {
  return (
    <aside className="w-56 border border-[#E2E2E2] bg-[#F9F9F9] flex flex-col shrink-0">
      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-base font-semibold text-[#1a1c1c] mb-3">Game Log</p>

        <div className="flex flex-col gap-3">
          {logs.length === 0 ? (
            <p className="text-xs text-[#ADADAD]">No moves yet.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[10px] text-[#ADADAD] shrink-0 mt-0.5">
                  {log.time}
                </span>
                <p className="text-xs text-[#444748]">{log.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Draw pile */}
      <div
        onClick={isMyTurn ? onDrawTile : undefined}
        className={`m-3 p-4 bg-[#1a1c1c] rounded-2xl transition-all ${isMyTurn ? 'cursor-pointer hover:opacity-85' : 'opacity-40 cursor-not-allowed'}`}
      >
        <p className="text-xs font-bold tracking-widest text-[#747878]">
          PILE REMAINIG
        </p>
        <p className="text-2xl font-bold text-white mt-1">
          {drawPileCount}
          <span className="text-sm font-normal text-[#747878] ml-1">tiles</span>
        </p>
      </div>
    </aside>
  );
};

export default GameLog;
