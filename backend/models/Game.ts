import mongoose, { Document, Schema } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Tile } from "@/lib/game/tiles";

export type GameStatus = "waiting" | "in-progress" | "finished";

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface IGamePlayer {
  userId: string;
  username: string;
}

export interface IGameLogEntry {
  timestamp: Date;
  userId: string;
  username: string;
  message: string; // human-readable, e.g. "played a run of 3, 4, 5 Red"
}

export interface IPlayerScore {
  userId: string;
  username: string;
  score: number;   // positive = winner bonus, negative = loser penalty
  tilesLeft: number;
  won: boolean;
}

// ─── Main Game document ───────────────────────────────────────────────────────

export interface IGame extends Document {
  roomId: string;
  tableId?: string;
  players: IGamePlayer[];
  status: GameStatus;
  currentTurn: string;       // userId of player whose turn it is
  turnCount: number;         // total turns played across all players

  // Rummikub-specific state (stored as Mixed for flexibility with Tile objects)
  deck: unknown[];              // Tile[] at runtime
  board: unknown[][];           // Tile[][] at runtime
  hands: Map<string, unknown[]>;

  // Tracks whether each player has completed their first 30-point meld
  initialMeldDone: Map<string, boolean>;

  // Game log shown in the sidebar
  gameLog: IGameLogEntry[];

  // Populated at game end
  scores: IPlayerScore[];
  winner?: string;           // userId

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const GameLogEntrySchema = new Schema<IGameLogEntry>(
  {
    timestamp: { type: Date, default: () => new Date() },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false }
);

const PlayerScoreSchema = new Schema<IPlayerScore>(
  {
    userId: String,
    username: String,
    score: Number,
    tilesLeft: Number,
    won: Boolean,
  },
  { _id: false }
);

const GameSchema = new Schema<IGame>(
  {
    roomId: { type: String, required: true, unique: true },
    tableId: { type: String },
    players: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        _id: false,
      },
    ],
    status: {
      type: String,
      enum: ["waiting", "in-progress", "finished"],
      default: "waiting",
    },
    currentTurn: { type: String, default: "" },
    turnCount: { type: Number, default: 0 },

    // Tile arrays stored as Schema.Types.Mixed — validated at the application layer
    deck: { type: Schema.Types.Mixed, default: [] },
    board: { type: Schema.Types.Mixed, default: [] },
    hands: { type: Map, of: Schema.Types.Mixed, default: {} },

    initialMeldDone: { type: Map, of: Boolean, default: {} },

    gameLog: { type: [GameLogEntrySchema], default: [] },
    scores: { type: [PlayerScoreSchema], default: [] },
    winner: { type: String },
  },
  { timestamps: true }
);

export const Game = mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);
