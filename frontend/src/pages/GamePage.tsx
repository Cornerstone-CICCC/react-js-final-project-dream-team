import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGame } from '../context/game/UseGame';
import { useUser } from '../context/user/UseUser';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Tile, TileGroup } from '../context/game/GameContext';
import Sidebar from '../components/game/Sidebar';
import Playerpanel from '../components/game/Playerpanel';
import Board from '../components/game/Board';
import Rack from '../components/game/Rack';
import GameLog from '../components/game/GameLog';
import TileCard from '../components/game/TileCard';

const GamePage = () => {
  const { gameState, drawTile, placeTiles, returnTiles, endTurn } = useGame();
  const { user } = useUser();
  const navigate = useNavigate();

  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [localBoard, setLocalBoard] = useState<TileGroup[]>(
    gameState?.board ?? [],
  );
  const [localRack, setLocalRack] = useState<Tile[]>(gameState?.rack ?? []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const isMyTurn = gameState?.currentTurn === user?.id;

  const handleDragStart = (event: DragStartEvent) => {
    const tile = event.active.data.current?.tile as Tile;
    setActiveTile(tile);
    setSelectedTile(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    setActiveTile(null);

    if (!over || over.id !== 'board') return;

    const tile = active.data.current?.tile as Tile;
    setLocalRack((prev) => prev.filter((t) => t.id !== tile.id));
    setLocalBoard((prev) => [...prev, [tile]]);
  };

  const handleDeclare = () => {
    if (!gameState || !user) return;
    placeTiles(gameState.gameId, user.id, localBoard);
  };

  const handleReturn = () => {
    if (!gameState || !user) return;
    returnTiles(gameState.gameId, user.id);
    setLocalBoard(gameState.board);
    setLocalRack(gameState.rack);
  };

  const handleEndTurn = () => {
    if (!gameState || !user) return;
    endTurn(gameState.gameId, user.id);
  };

  const handleDrawTile = () => {
    if (!gameState || !user) return;
    drawTile(gameState.gameId, user.id);
  };

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-[#747878]">Connecting to game...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Players */}
          <Playerpanel
            players={gameState.players}
            currentTurn={gameState.currentTurn}
            currentUserId={user?.id ?? ''}
          />

          {/* Board */}
          <Board board={localBoard} />

          {/* Rack */}
          <Rack
            rack={localRack}
            selectedTile={selectedTile}
            isMyTurn={isMyTurn}
            onSelectTile={setSelectedTile}
            onDeclare={handleDeclare}
            onReturn={handleReturn}
            onEndTurn={handleEndTurn}
          />
        </div>

        {/* Game Log */}
        <GameLog
          logs={[
            { time: '09:41', text: 'Jordan played a run of 3, 4, 5, 6 Black.' },
            { time: '09:40', text: 'Sam drew a tile from the pile.' },
            { time: '09:38', text: 'Alex declared a group of 10s.' },
            { time: '09:37', text: 'Game started. Initial draw completed.' },
          ]}
          drawPileCount={gameState.drawPileCount}
          isMyTurn={isMyTurn}
          onDrawTile={handleDrawTile}
        />
      </div>

      {/* Drag overlay */}
      <DragOverlay>{activeTile && <TileCard tile={activeTile} />}</DragOverlay>

      {/* Game over modal */}
      {gameState.winner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center gap-4 shadow-2xl">
            <span className="text-4xl">🏆</span>
            <h2 className="text-3xl font-bold text-[#1a1c1c]">
              {gameState.winner.id === user?.id
                ? 'You Won!'
                : `${gameState.winner.username} Won!`}
            </h2>
            <p className="text-xs font-bold tracking-widest text-[#ADADAD]">
              GAME COMPLETE
            </p>

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => navigate('/lobby')}
                className="flex-1 py-4 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/lobby')}
                className="flex-1 py-4 border-2 border-[#1a1c1c] text-[#1a1c1c] text-sm font-bold rounded-full hover:bg-[#F3F3F4] transition-all"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
};

export default GamePage;
