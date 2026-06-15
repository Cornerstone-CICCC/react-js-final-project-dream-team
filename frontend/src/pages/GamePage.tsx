import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
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
import PlayerPanel from '../components/game/Playerpanel';
import Board from '../components/game/Board';
import Rack from '../components/game/Rack';
import GameLog from '../components/game/GameLog';
import TileCard from '../components/game/TileCard';

const GamePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState, joinGame, startGame, playTurn, drawTile, leaveGame } =
    useGame();
  const { user } = useUser();
  const navigate = useNavigate();

  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [localBoard, setLocalBoard] = useState<TileGroup[]>([]);
  const [localRack, setLocalRack] = useState<Tile[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const isMyTurn = gameState?.currentTurn === user?.id;
  const isWaiting = gameState?.status === 'waiting';
  const isHost = gameState?.players[0]?.userId === user?.id;

  useEffect(() => {
    if (roomId) joinGame(roomId);
    return () => {
      if (roomId) leaveGame(roomId);
    };
  }, [roomId]);

  useEffect(() => {
    if (gameState?.board) setLocalBoard(gameState.board);
    if (gameState?.myHand) setLocalRack(gameState.myHand);
  }, [gameState]);

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
    if (!roomId || !gameState) return;
    const played = gameState.myHand.filter(
      (t) => !localRack.find((r) => r.id === t.id),
    );
    playTurn(roomId, localBoard, played);
  };

  const handleReturn = () => {
    if (!gameState) return;
    setLocalBoard(gameState.board);
    setLocalRack(gameState.myHand);
  };

  const handleEndTurn = () => {
    if (!roomId) return;
    drawTile(roomId);
  };

  const handleDrawTile = () => {
    if (!roomId) return;
    drawTile(roomId);
  };

  const handleStartGame = () => {
    if (!roomId) return;
    startGame(roomId);
  };

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-[#747878]">Connecting to game...</p>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold text-[#1a1c1c]">
          Waiting for players...
        </h2>
        <p className="text-sm text-[#747878]">
          {gameState.players.length} / 4 players joined
        </p>
        <div className="flex flex-col gap-2">
          {gameState.players.map((p) => (
            <div
              key={p.userId}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E2E2] rounded-full"
            >
              <div className="w-6 h-6 rounded-full bg-[#E2E2E2] flex items-center justify-center">
                <span className="text-xs font-bold text-[#747878]">
                  {p.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-[#1a1c1c]">
                {p.username}
              </span>
              {p.userId === gameState.players[0].userId && (
                <span className="text-xs text-[#ADADAD]">host</span>
              )}
            </div>
          ))}
        </div>

        {isHost && gameState.players.length >= 2 && (
          <button
            onClick={handleStartGame}
            className="px-8 py-3 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 transition-all"
          >
            Start Game
          </button>
        )}

        <button
          onClick={() => {
            leaveGame(roomId!);
            navigate('/lobby');
          }}
          className="text-sm text-[#747878] hover:text-[#1a1c1c] transition-colors"
        >
          Leave Table
        </button>
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
        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <PlayerPanel
            players={gameState.players.map((p) => ({
              id: p.userId,
              username: p.username,
              tileCount: gameState.handSizes[p.userId] ?? 0,
            }))}
            currentTurn={gameState.currentTurn}
            currentUserId={user?.id ?? ''}
          />

          <Board board={localBoard} />

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
          logs={gameState.gameLog.map((log) => ({
            time: new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            text: `${log.username} ${log.message}`,
          }))}
          drawPileCount={gameState.deckSize}
          isMyTurn={isMyTurn}
          onDrawTile={handleDrawTile}
        />
      </div>

      {/* Drag overlay */}
      <DragOverlay>{activeTile && <TileCard tile={activeTile} />}</DragOverlay>

      {/* Game over modal */}
      {gameState.status === 'finished' && gameState.winner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center gap-4 shadow-2xl">
            <span className="text-4xl">🏆</span>
            <h2 className="text-3xl font-bold text-[#1a1c1c]">
              {gameState.winner === user?.id
                ? 'You Won!'
                : `${gameState.players.find((p) => p.userId === gameState.winner)?.username} Won!`}
            </h2>
            <p className="text-xs font-bold tracking-widest text-[#ADADAD]">
              GAME COMPLETE
            </p>

            {/* Scores */}
            <div className="w-full flex flex-col gap-2 mt-2">
              {gameState.scores.map((s) => (
                <div
                  key={s.userId}
                  className="flex justify-between items-center px-4 py-2 bg-[#F3F3F4] rounded-xl"
                >
                  <span className="text-sm font-medium text-[#1a1c1c]">
                    {s.username}
                  </span>
                  <span
                    className={`text-sm font-bold ${s.score >= 0 ? 'text-[#1D9E75]' : 'text-[#ea4d1c]'}`}
                  >
                    {s.score > 0 ? `+${s.score}` : s.score}
                  </span>
                </div>
              ))}
            </div>

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
