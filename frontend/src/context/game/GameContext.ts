import { createContext } from 'react';

export type TileColor = 'red' | 'blue' | 'black' | 'yellow';

export interface Tile {
  id: string;
  number: number;
  color: TileColor;
}

export type TileGroup = Tile[];

export interface Player {
  id: string;
  username: string;
  tileCount: number;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentTurn: string;
  board: TileGroup[];
  rack: Tile[];
  drawPileCount: number;
  isStarted: boolean;
  winner: Player | null;
}

type GameContextType = {
  gameState: GameState | null;
  isConnected: boolean;
  joinRoom: (roomId: string, userId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  drawTile: (gameId: string, playerId: string) => void;
  placeTiles: (gameId: string, playerId: string, groups: TileGroup[]) => void;
  returnTiles: (gameId: string, playerId: string) => void;
  endTurn: (gameId: string, playerId: string) => void;
};

export const GameContext = createContext<GameContextType>({
  gameState: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  drawTile: () => {},
  placeTiles: () => {},
  returnTiles: () => {},
  endTurn: () => {},
});
