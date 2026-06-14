/**
 * Rummikub scoring rules.
 *
 * When a player wins (empties their hand):
 *   - Each losing player's score = negative sum of tiles remaining in their hand.
 *   - Joker in hand = -30 points.
 *   - The winner's score = the sum of all losers' penalties (positive).
 *
 * Initial meld requirement:
 *   - A player's very first play must consist of melds that total ≥ 30 points,
 *     counted only from the tiles coming OUT of their hand (not board tiles).
 *   - Joker value in this context = the number it represents in the meld.
 */

import { Tile, tileValue } from "./tiles";

export interface PlayerResult {
  userId: string;
  username: string;
  score: number;      // positive = winner bonus, negative = penalty
  tilesLeft: number;  // number of tiles remaining in hand at game end
  won: boolean;
}

/**
 * Calculate final scores for all players when the game ends.
 *
 * @param players   List of players (userId + username).
 * @param hands     Map of userId → tiles still in hand at game end.
 * @param winnerId  The userId of the player who emptied their hand.
 */
export function calcFinalScores(
  players: { userId: string; username: string }[],
  hands: Map<string, Tile[]>,
  winnerId: string
): PlayerResult[] {
  const results: PlayerResult[] = [];
  let totalPenalty = 0;

  // Calculate each loser's penalty
  for (const player of players) {
    if (player.userId === winnerId) continue;

    const hand = hands.get(player.userId) ?? [];
    const penalty = hand.reduce((sum, t) => sum + tileValue(t), 0);
    totalPenalty += penalty;

    results.push({
      userId: player.userId,
      username: player.username,
      score: -penalty,
      tilesLeft: hand.length,
      won: false,
    });
  }

  // Winner gets the sum of all penalties as a positive score
  results.push({
    userId: winnerId,
    username: players.find((p) => p.userId === winnerId)!.username,
    score: totalPenalty,
    tilesLeft: 0,
    won: true,
  });

  return results;
}

/**
 * Calculate the point total of tiles a player is placing from their hand
 * during their initial meld.  Must be ≥ 30 to be accepted.
 *
 * This is a simple sum of the non-joker tile face values; for jokers the
 * value is the number they represent (passed in as resolvedJokerValues).
 *
 * @param playedTiles         The tiles the player is placing from their hand.
 * @param resolvedJokerValues Map of joker tile ID → the number it represents.
 */
export function calcInitialMeldValue(
  playedTiles: Tile[],
  resolvedJokerValues: Map<string, number> = new Map()
): number {
  return playedTiles.reduce((sum, tile) => {
    if (tile.isJoker) {
      return sum + (resolvedJokerValues.get(tile.id) ?? 0);
    }
    return sum + tile.number!;
  }, 0);
}

export const INITIAL_MELD_MIN = 30;
