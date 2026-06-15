import { createContext } from 'react';

export type TileColor = 'red' | 'blue' | 'black' | 'orange';

export interface Tile {
  id: string;
  color: TileColor | null;
  number: number | null;
  isJoker: boolean;
}

export type TileGroup = Tile[];

export interface Player {
  userId: string;
  username: string;
}

export interface GameLogEntry {
  timestamp: string;
  userId: string;
  username: string;
  message: string;
}

export interface PlayerScore {
  userId: string;
  username: string;
  score: number;
  tilesLeft: number;
  won: boolean;
}

export interface GameState {
  roomId: string;
  status: 'waiting' | 'in-progress' | 'finished';
  players: Player[];
  currentTurn: string;
  turnCount: number;
  board: TileGroup[];
  deckSize: number;
  myHand: Tile[];
  handSizes: Record<string, number>;
  initialMeldDone: Record<string, boolean>;
  gameLog: GameLogEntry[];
  scores: PlayerScore[];
  winner: string | null; // userId
}

type GameContextType = {
  gameState: GameState | null;
  isConnected: boolean;
  joinGame: (roomId: string) => void;
  startGame: (roomId: string) => void;
  playTurn: (
    roomId: string,
    newBoard: TileGroup[],
    tilesPlayed: Tile[],
  ) => void;
  drawTile: (roomId: string) => void;
  leaveGame: (roomId: string) => void;
};

export const GameContext = createContext<GameContextType>({
  gameState: null,
  isConnected: false,
  joinGame: () => {},
  startGame: () => {},
  playTurn: () => {},
  drawTile: () => {},
  leaveGame: () => {},
});
