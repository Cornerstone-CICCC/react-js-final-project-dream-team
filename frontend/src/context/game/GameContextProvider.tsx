import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameContext } from './GameContext';
import type { GameState, TileGroup } from './GameContext';

const SOCKET_URL = 'http://localhost:4000';

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

    newSocket.on('game:state', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('move:valid', (updateState: Partial<GameState>) => {
      setGameState((prev) => (prev ? { ...prev, ...updateState } : prev));
    });

    newSocket.on('turn:change', (currentTurn: string) => {
      setGameState((prev) => (prev ? { ...prev, currentTurn } : prev));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  //////////////////////////////////

  const joinRoom = useCallback(
    (roomId: string, userId: string) => {
      socket?.emit('room:join', { roomId, userId });
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (roomId: string, userId: string) => {
      socket?.emit('room:leave', { roomId, userId });
    },
    [socket],
  );

  const drawTile = useCallback(
    (gameId: string, playerId: string) => {
      socket?.emit('tile:draw', { gameId, playerId });
    },
    [socket],
  );

  const placeTiles = useCallback(
    (gameId: string, playerId: string, groups: TileGroup[]) => {
      socket?.emit('tile:place', { gameId, playerId, groups });
    },
    [socket],
  );

  const returnTiles = useCallback(
    (gameId: string, playerId: string) => {
      socket?.emit('tile:return', { gameId, playerId });
    },
    [socket],
  );

  const endTurn = useCallback(
    (gameId: string, playerId: string) => {
      socket?.emit('turn:end', { gameId, playerId });
    },
    [socket],
  );

  return (
    <GameContext.Provider
      value={{
        gameState,
        isConnected,
        joinRoom,
        leaveRoom,
        drawTile,
        placeTiles,
        returnTiles,
        endTurn,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContextProvider;
