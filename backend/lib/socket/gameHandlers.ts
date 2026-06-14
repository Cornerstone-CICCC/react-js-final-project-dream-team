/**
 * Rummikub Socket.IO game handlers.
 *
 * Events the SERVER listens for:
 *   game:join       — join a game room (creates the Game doc if needed)
 *   game:start      — deal 14 tiles to each player and begin
 *   game:playTurn   — player submits a new board state + tiles from hand
 *   game:draw       — player cannot/will not play; draws one tile from pool
 *
 * Events the SERVER emits:
 *   game:state      — full game snapshot (sent after every state change)
 *   game:error      — invalid move, sent only to the requesting socket
 *   game:over       — game finished, includes scores and winner
 */

import { Server, Socket } from "socket.io";
import { connectDB } from "@/lib/db";
import { Game } from "@/models/Game";
import { buildShuffledDeck } from "@/lib/game/tiles";
import { validateBoardTransition, calcPlayedValue } from "@/lib/game/validation";
import { calcFinalScores, INITIAL_MELD_MIN } from "@/lib/game/scoring";
import type { Tile } from "@/lib/game/tiles";

const TILES_PER_PLAYER = 14;

// ─── Handler registration ─────────────────────────────────────────────────────

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on("game:join", (data) => handleJoin(io, socket, data));
  socket.on("game:start", (data) => handleStart(io, socket, data));
  socket.on("game:playTurn", (data) => handlePlayTurn(io, socket, data));
  socket.on("game:draw", (data) => handleDraw(io, socket, data));
}

// ─── game:join ────────────────────────────────────────────────────────────────

async function handleJoin(
  io: Server,
  socket: Socket,
  { roomId, userId, username }: { roomId: string; userId: string; username: string }
) {
  await connectDB();
  socket.join(roomId);

  let game = await Game.findOne({ roomId });

  if (!game) {
    game = await Game.create({ roomId, players: [{ userId, username }] });
  } else if (!game.players.find((p: { userId: string }) => p.userId === userId)) {
    game.players.push({ userId, username });
    game.initialMeldDone.set(userId, false);
    await game.save();
  }

  io.to(roomId).emit("game:state", serializeGame(game, userId));
}

// ─── game:start ───────────────────────────────────────────────────────────────

async function handleStart(
  io: Server,
  socket: Socket,
  { roomId, userId }: { roomId: string; userId: string }
) {
  await connectDB();
  const game = await Game.findOne({ roomId });

  if (!game) return emit(socket, "game:error", "Game not found.");
  if (game.status !== "waiting") return emit(socket, "game:error", "Game already started.");
  if (game.players.length < 2) return emit(socket, "game:error", "Need at least 2 players.");
  if (game.players[0].userId !== userId) return emit(socket, "game:error", "Only the host can start the game.");

  const deck = buildShuffledDeck();

  // Deal 14 tiles to each player
  for (const player of game.players) {
    const hand = deck.splice(0, TILES_PER_PLAYER);
    game.hands.set(player.userId, hand);
    game.initialMeldDone.set(player.userId, false);
  }

  game.deck = deck;
  game.board = [];
  game.status = "in-progress";
  game.currentTurn = game.players[0].userId;
  game.turnCount = 0;

  addLog(game, { userId: "system", username: "System", message: "Game started. Initial draw completed." });

  await game.save();

  // Each player gets their own snapshot (so hands stay private)
  for (const player of game.players) {
    const socketIds = await io.in(roomId).fetchSockets();
    const playerSocket = socketIds.find((s) => s.data?.userId === player.userId);
    if (playerSocket) {
      playerSocket.emit("game:state", serializeGame(game, player.userId));
    }
  }

  // Broadcast the public board state to everyone
  io.to(roomId).emit("game:state", serializeGame(game, null));
}

// ─── game:playTurn ────────────────────────────────────────────────────────────
/**
 * The player sends:
 *   - newBoard    : Tile[][] — the full board after their move (can rearrange existing melds)
 *   - tilesPlayed : Tile[]  — tiles coming OUT of the player's hand this turn
 *
 * Validation steps:
 *   1. It is this player's turn.
 *   2. Every meld on newBoard is valid.
 *   3. No tiles were invented — every tile on newBoard came from either the
 *      old board or tilesPlayed (which must be in the player's hand).
 *   4. No old-board tiles were pocketed.
 *   5. If it's the player's initial meld, the value of tilesPlayed ≥ 30.
 *   6. At least one tile was played (can't pass without drawing).
 */
async function handlePlayTurn(
  io: Server,
  socket: Socket,
  {
    roomId,
    userId,
    newBoard,
    tilesPlayed,
  }: { roomId: string; userId: string; newBoard: Tile[][]; tilesPlayed: Tile[] }
) {
  await connectDB();
  const game = await Game.findOne({ roomId });

  if (!game) return emit(socket, "game:error", "Game not found.");
  if (game.status !== "in-progress") return emit(socket, "game:error", "Game is not in progress.");
  if (game.currentTurn !== userId) return emit(socket, "game:error", "It is not your turn.");
  if (!tilesPlayed || tilesPlayed.length === 0) return emit(socket, "game:error", "You must play at least one tile or draw.");

  const hand: Tile[] = game.hands.get(userId) ?? [];
  const playedIds = new Set(tilesPlayed.map((t) => t.id));

  // Verify every played tile is actually in the player's hand
  for (const tile of tilesPlayed) {
    if (!hand.find((t) => t.id === tile.id)) {
      return emit(socket, "game:error", `Tile "${tile.id}" is not in your hand.`);
    }
  }

  // Validate the board transition
  const oldBoardIds = new Set<string>((game.board as Tile[][]).flat().map((t: Tile) => t.id));
  const boardCheck = validateBoardTransition(newBoard, oldBoardIds, playedIds);
  if (!boardCheck.valid) {
    return emit(socket, "game:error", boardCheck.reason!);
  }

  // Enforce initial meld rule (≥ 30 points from hand tiles only)
  const hasInitialMeld = game.initialMeldDone.get(userId) ?? false;
  if (!hasInitialMeld) {
    const playedValue = calcPlayedValue(newBoard, playedIds);
    if (playedValue < INITIAL_MELD_MIN) {
      return emit(
        socket,
        "game:error",
        `Your first meld must total at least ${INITIAL_MELD_MIN} points. Yours totals ${playedValue}.`
      );
    }
    game.initialMeldDone.set(userId, true);
  }

  // Apply the move
  game.board = newBoard;
  const newHand = hand.filter((t) => !playedIds.has(t.id));
  game.hands.set(userId, newHand);
  game.turnCount += 1;

  // Build a readable log message
  const logMsg = buildPlayLogMessage(tilesPlayed, newBoard, playedIds);
  const player = game.players.find((p: { userId: string }) => p.userId === userId)!;
  addLog(game, { userId, username: player.username, message: logMsg });

  // Check for win (hand is empty)
  if (newHand.length === 0) {
    await finishGame(io, game, userId);
    return;
  }

  // Advance turn
  advanceTurn(game);
  await game.save();

  broadcastState(io, game);
}

// ─── game:draw ────────────────────────────────────────────────────────────────

async function handleDraw(
  io: Server,
  socket: Socket,
  { roomId, userId }: { roomId: string; userId: string }
) {
  await connectDB();
  const game = await Game.findOne({ roomId });

  if (!game) return emit(socket, "game:error", "Game not found.");
  if (game.status !== "in-progress") return emit(socket, "game:error", "Game is not in progress.");
  if (game.currentTurn !== userId) return emit(socket, "game:error", "It is not your turn.");

  const player = game.players.find((p: { userId: string }) => p.userId === userId)!;

  if (game.deck.length === 0) {
    // Pool is empty — player must pass
    addLog(game, { userId, username: player.username, message: "passed (pool is empty)." });
  } else {
    const tile = (game.deck as Tile[]).shift()!;
    const hand: Tile[] = (game.hands.get(userId) ?? []) as Tile[];
    hand.push(tile);
    game.hands.set(userId, hand);
    addLog(game, { userId, username: player.username, message: "drew a tile from the pool." });
  }

  advanceTurn(game);
  await game.save();

  broadcastState(io, game);
  // Also send the drawing player their updated private hand
  socket.emit("game:state", serializeGame(game, userId));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Emit a game:error only to the requesting socket. */
function emit(socket: Socket, event: string, message: string) {
  socket.emit(event, { message });
}

/** Advance currentTurn to the next player in order. */
function advanceTurn(game: InstanceType<typeof Game>) {
  const idx = game.players.findIndex(
    (p: { userId: string }) => p.userId === game.currentTurn
  );
  const next = (idx + 1) % game.players.length;
  game.currentTurn = game.players[next].userId;
}

/** Append a log entry to the game log (keep last 100 entries). */
function addLog(
  game: InstanceType<typeof Game>,
  entry: { userId: string; username: string; message: string }
) {
  game.gameLog.push({ ...entry, timestamp: new Date() });
  if (game.gameLog.length > 100) game.gameLog.shift();
}

/** Close the game, calculate scores, persist, and broadcast game:over. */
async function finishGame(
  io: Server,
  game: InstanceType<typeof Game>,
  winnerId: string
) {
  game.status = "finished";
  game.winner = winnerId;

  const handsMap = new Map<string, Tile[]>();
  for (const player of game.players) {
    handsMap.set(player.userId, (game.hands.get(player.userId) ?? []) as Tile[]);
  }

  const scores = calcFinalScores(game.players, handsMap, winnerId);
  game.scores = scores;

  const winner = game.players.find((p: { userId: string }) => p.userId === winnerId)!;
  const winnerScore = scores.find((s) => s.userId === winnerId)!;
  addLog(game, {
    userId: winnerId,
    username: winner.username,
    message: `won the game! Final score: ${winnerScore.score} in ${game.turnCount} turns.`,
  });

  await game.save();

  io.to(game.roomId).emit("game:over", {
    winner: { userId: winnerId, username: winner.username },
    scores,
    turnCount: game.turnCount,
  });

  broadcastState(io, game);
}

/**
 * Broadcast the public game state to everyone in the room.
 * Hand contents are stripped — each player fetches their own hand
 * separately via the private snapshot sent during key events.
 */
function broadcastState(io: Server, game: InstanceType<typeof Game>) {
  io.to(game.roomId).emit("game:state", serializeGame(game, null));
}

/**
 * Serialize the game document for the wire.
 * If userId is provided, include that player's private hand.
 * Otherwise hands are omitted (public broadcast).
 */
function serializeGame(
  game: InstanceType<typeof Game>,
  viewingUserId: string | null
) {
  return {
    roomId: game.roomId,
    status: game.status,
    players: game.players,
    currentTurn: game.currentTurn,
    turnCount: game.turnCount,
    board: game.board,
    deckSize: game.deck.length,
    initialMeldDone: Object.fromEntries(game.initialMeldDone),
    gameLog: game.gameLog.slice(-20), // last 20 entries for the sidebar
    scores: game.scores,
    winner: game.winner,
    // Only include the viewing player's hand (keeps other hands private)
    myHand: viewingUserId ? ((game.hands.get(viewingUserId) ?? []) as Tile[]) : undefined,
    handSizes: Object.fromEntries(
      game.players.map((p: { userId: string }) => [
        p.userId,
        ((game.hands.get(p.userId) ?? []) as Tile[]).length,
      ])
    ),
  };
}

/**
 * Build a human-readable game log message from the tiles played.
 * Examples:
 *   "played a run of 3, 4, 5 Red"
 *   "declared a group of 10s"
 *   "played 2 tiles"
 */
function buildPlayLogMessage(
  tilesPlayed: Tile[],
  newBoard: Tile[][],
  playedIds: Set<string>
): string {
  // Find the meld(s) containing the played tiles
  const involvedMelds = newBoard.filter((meld) =>
    meld.some((t) => playedIds.has(t.id))
  );

  if (involvedMelds.length === 1) {
    const meld = involvedMelds[0];
    const nonJokers = meld.filter((t) => !t.isJoker);

    // Detect set vs run
    const numbers = [...new Set(nonJokers.map((t) => t.number!))];
    const colors = [...new Set(nonJokers.map((t) => t.color!))];

    if (numbers.length === 1) {
      // It's a set of the same number
      return `declared a group of ${numbers[0]}s.`;
    }

    if (colors.length === 1) {
      // It's a run
      const sorted = nonJokers.map((t) => t.number!).sort((a, b) => a - b);
      return `played a run of ${sorted.join(", ")} ${capitalize(colors[0])}.`;
    }
  }

  return `played ${tilesPlayed.length} tile${tilesPlayed.length > 1 ? "s" : ""}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

