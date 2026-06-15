import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameContext } from './GameContext';
import type { GameState, TileGroup, Tile } from './GameContext';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const GameContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Full game snapshot after every state change
    newSocket.on('game:state', (state: GameState) => {
      setGameState((prev) => {
        if (!prev) return state;

        return {
          ...prev,
          ...state,
          myHand: state.myHand ?? prev.myHand,
        };
      });
    });

    // Error from server — invalid move or unauthorized action
    newSocket.on('game:error', ({ message }: { message: string }) => {
      toast.error(message || 'Something went wrong.');
    });

    // Game finished — includes scores and winner
    newSocket.on(
      'game:over',
      ({
        winner,
        scores,
        turnCount,
      }: {
        winner: { userId: string; username: string };
        scores: GameState['scores'];
        turnCount: number;
      }) => {
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                winner: winner.userId,
                scores,
                turnCount,
                status: 'finished',
              }
            : prev,
        );
      },
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ── Emit actions ─────────────────────────────────────────────────────────

  const joinGame = useCallback(
    (roomId: string) => {
      socket?.emit('game:join', { roomId });
    },
    [socket],
  );

  const startGame = useCallback(
    (roomId: string) => {
      socket?.emit('game:start', { roomId });
    },
    [socket],
  );

  const playTurn = useCallback(
    (roomId: string, newBoard: TileGroup[], tilesPlayed: Tile[]) => {
      socket?.emit('game:playTurn', { roomId, newBoard, tilesPlayed });
    },
    [socket],
  );

  const drawTile = useCallback(
    (roomId: string) => {
      socket?.emit('game:draw', { roomId });
    },
    [socket],
  );

  const endTurn = useCallback(
    (roomId: string) => {
      socket?.emit('game:endTurn', { roomId });
    },
    [socket],
  );

  const leaveGame = useCallback(
    (roomId: string) => {
      socket?.emit('game:leave', { roomId });
    },
    [socket],
  );

  return (
    <GameContext.Provider
      value={{
        gameState,
        isConnected,
        joinGame,
        startGame,
        playTurn,
        drawTile,
        endTurn,
        leaveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContextProvider;
