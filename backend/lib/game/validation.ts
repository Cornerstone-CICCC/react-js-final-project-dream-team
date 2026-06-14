/**
 * Rummikub meld validation.
 *
 * Two types of valid melds:
 *
 *   RUN  — 3 or more tiles of the SAME colour in consecutive numeric order.
 *           Example: Red-3, Red-4, Red-5  /  Blue-11, Blue-12, Blue-13
 *
 *   SET  — 3 or 4 tiles with the SAME number but DIFFERENT colours.
 *           Example: Red-7, Blue-7, Black-7
 *
 * JOKER rules (standard Rummikub):
 *   - A joker can substitute for any missing tile in a run or set.
 *   - A meld may contain at most ONE joker.
 *   - For initial-meld scoring, a joker's value is the tile it represents
 *     (not 30 — the 30-point penalty only applies to unplayed jokers at game end).
 */

import { Tile, TileColor } from "./tiles";

// ─── Public API ──────────────────────────────────────────────────────────────

/** Returns true if the meld is a valid run OR a valid set. */
export function isValidMeld(meld: Tile[]): boolean {
  return isValidRun(meld) || isValidSet(meld);
}

/** Returns true if every meld on the board is valid. */
export function isBoardValid(board: Tile[][]): boolean {
  return board.every(isValidMeld);
}

// ─── Run validation ───────────────────────────────────────────────────────────

/**
 * A run is valid when:
 *  1. At least 3 tiles total.
 *  2. At most 1 joker.
 *  3. All non-joker tiles share the same colour.
 *  4. All non-joker tile numbers are unique.
 *  5. Joker(s) + non-joker tiles can form a gapless consecutive sequence
 *     entirely within 1–13.
 */
export function isValidRun(meld: Tile[]): boolean {
  if (meld.length < 3) return false;

  const jokers = meld.filter((t) => t.isJoker);
  const nonJokers = meld.filter((t) => !t.isJoker);

  if (jokers.length > 1) return false;  // at most 1 joker per meld
  if (nonJokers.length === 0) return false;

  // All non-jokers must be the same colour
  const color: TileColor = nonJokers[0].color!;
  if (!nonJokers.every((t) => t.color === color)) return false;

  // All non-joker numbers must be distinct
  const nums = nonJokers.map((t) => t.number!).sort((a, b) => a - b);
  if (new Set(nums).size !== nums.length) return false;

  const min = nums[0];
  const max = nums[nums.length - 1];

  // Calculate how many gaps exist between the non-joker numbers
  // (a gap is a missing number in the sorted list)
  let gapsInsideSpan = 0;
  for (let i = 1; i < nums.length; i++) {
    gapsInsideSpan += nums[i] - nums[i - 1] - 1;
  }

  // The joker (if any) must fill exactly one of those gaps
  // OR extend the sequence by one position at either end
  const jokerCount = jokers.length; // 0 or 1

  // Case A — no joker: the numbers must already be consecutive
  if (jokerCount === 0) {
    if (gapsInsideSpan !== 0) return false;
    if (min < 1 || max > 13) return false;
    return true;
  }

  // Case B — one joker
  if (gapsInsideSpan === 1) {
    // Joker fills the single internal gap; the span sits within 1–13
    if (min < 1 || max > 13) return false;
    return true;
  }

  if (gapsInsideSpan === 0) {
    // Joker extends the run at one end: left (min-1) or right (max+1)
    const canExtendLeft = min - 1 >= 1;
    const canExtendRight = max + 1 <= 13;
    return canExtendLeft || canExtendRight;
  }

  // More than one gap — can't fill them all with a single joker
  return false;
}

// ─── Set validation ───────────────────────────────────────────────────────────

/**
 * A set is valid when:
 *  1. Exactly 3 or 4 tiles.
 *  2. At most 1 joker.
 *  3. All non-joker tiles share the same number.
 *  4. All non-joker tile colours are unique.
 *  5. The total number of colours (non-jokers + joker slot) does not exceed 4.
 */
export function isValidSet(meld: Tile[]): boolean {
  if (meld.length < 3 || meld.length > 4) return false;

  const jokers = meld.filter((t) => t.isJoker);
  const nonJokers = meld.filter((t) => !t.isJoker);

  if (jokers.length > 1) return false;
  if (nonJokers.length === 0) return false;

  // All non-jokers must share the same number
  const number = nonJokers[0].number;
  if (!nonJokers.every((t) => t.number === number)) return false;

  // All non-joker colours must be unique
  const colors = nonJokers.map((t) => t.color!);
  if (new Set(colors).size !== colors.length) return false;

  // Total tile count already checked by length guard (≤ 4)
  return true;
}

// ─── Board-state helpers ──────────────────────────────────────────────────────

/**
 * Given a proposed board state and the set of tile IDs that existed on the
 * board BEFORE this turn, verify that:
 *  1. Every meld on the new board is valid.
 *  2. No tiles have been fabricated — every tile on the new board either
 *     existed on the old board OR is in the list of newly played tiles.
 *  3. Every old-board tile is still present somewhere on the new board
 *     (tiles can be moved between melds but never removed).
 */
export function validateBoardTransition(
  newBoard: Tile[][],
  oldBoardTileIds: Set<string>,
  playedTileIds: Set<string>
): { valid: boolean; reason?: string } {
  // Check all melds are valid
  for (let i = 0; i < newBoard.length; i++) {
    if (!isValidMeld(newBoard[i])) {
      return { valid: false, reason: `Meld at position ${i + 1} is not valid.` };
    }
  }

  const newBoardTileIds = new Set(newBoard.flat().map((t) => t.id));

  // Ensure no tile was invented out of thin air
  for (const id of newBoardTileIds) {
    if (!oldBoardTileIds.has(id) && !playedTileIds.has(id)) {
      return { valid: false, reason: `Tile "${id}" was not in your hand or on the board.` };
    }
  }

  // Ensure every old-board tile is still present (can't pocket board tiles)
  for (const id of oldBoardTileIds) {
    if (!newBoardTileIds.has(id)) {
      return { valid: false, reason: `Board tile "${id}" is missing from the new board state.` };
    }
  }

  return { valid: true };
}

/**
 * Calculate the value of the tiles a player is NEWLY placing from their hand.
 * Used to enforce the 30-point initial meld requirement.
 *
 * Joker value in this context = the tile it represents in the meld (NOT 30).
 * We approximate the joker's value by looking at the surrounding tiles in the meld.
 */
export function calcPlayedValue(newBoard: Tile[][], playedTileIds: Set<string>): number {
  let total = 0;

  for (const meld of newBoard) {
    const jokerInMeld = meld.find((t) => t.isJoker);

    for (const tile of meld) {
      if (!playedTileIds.has(tile.id)) continue; // skip tiles already on board

      if (tile.isJoker) {
        // Estimate joker value from its neighbours in the meld
        total += inferJokerValue(meld, jokerInMeld!);
      } else {
        total += tile.number!;
      }
    }
  }

  return total;
}

/**
 * Infer the numeric value a joker represents inside a meld.
 * For a set: same number as the non-joker tiles.
 * For a run: the missing number in the sequence (or the extension number).
 */
function inferJokerValue(meld: Tile[], _joker: Tile): number {
  const nonJokers = meld.filter((t) => !t.isJoker);

  // Set — joker takes the common number
  if (isValidSet(meld)) {
    return nonJokers[0].number!;
  }

  // Run — find the missing position
  const nums = nonJokers.map((t) => t.number!).sort((a, b) => a - b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] > 1) {
      return nums[i - 1] + 1; // the gap
    }
  }
  // Extension — joker is beyond one end; pick the closer valid number
  const extRight = nums[nums.length - 1] + 1;
  const extLeft = nums[0] - 1;
  if (extRight <= 13) return extRight;
  if (extLeft >= 1) return extLeft;
  return 0;
}
