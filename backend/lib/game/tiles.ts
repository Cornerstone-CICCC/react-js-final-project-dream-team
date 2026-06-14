/**
 * Rummikub tile representation and deck builder.
 *
 * A standard Rummikub set has:
 *   - 2 copies of tiles 1–13 in 4 colours = 104 tiles
 *   - 2 jokers
 *   = 106 tiles total
 *
 * Tile ID format:
 *   Regular tile : "{color_initial}{number}_{copy}"  e.g. "R7_1", "B13_2"
 *   Joker        : "J1" or "J2"
 *
 * Colour initials: R = red, B = blue, K = blacK, O = orange
 */

export type TileColor = "red" | "blue" | "black" | "orange";

export interface Tile {
  id: string;
  color: TileColor | null; // null for jokers
  number: number | null;   // null for jokers
  isJoker: boolean;
}

const COLOR_INITIAL: Record<TileColor, string> = {
  red: "R",
  blue: "B",
  black: "K",
  orange: "O",
};

const COLORS: TileColor[] = ["red", "blue", "black", "orange"];
const NUMBERS = Array.from({ length: 13 }, (_, i) => i + 1); // 1–13

/** Build and return a freshly shuffled 106-tile Rummikub deck. */
export function buildShuffledDeck(): Tile[] {
  const deck: Tile[] = [];

  // Two copies of each colour × number combination
  for (const color of COLORS) {
    for (const number of NUMBERS) {
      for (const copy of [1, 2]) {
        deck.push({
          id: `${COLOR_INITIAL[color]}${number}_${copy}`,
          color,
          number,
          isJoker: false,
        });
      }
    }
  }

  // Two jokers
  deck.push({ id: "J1", color: null, number: null, isJoker: true });
  deck.push({ id: "J2", color: null, number: null, isJoker: true });

  return shuffle(deck);
}

/** Fisher-Yates in-place shuffle — returns the same array. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Return the point value of a single tile (used for scoring). */
export function tileValue(tile: Tile): number {
  if (tile.isJoker) return 30;
  return tile.number!;
}

/** Sum the point values of a list of tiles. */
export function sumTiles(tiles: Tile[]): number {
  return tiles.reduce((sum, t) => sum + tileValue(t), 0);
}
