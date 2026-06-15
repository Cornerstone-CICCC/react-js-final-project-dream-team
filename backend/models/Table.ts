import mongoose, { Document, Schema } from "mongoose";

export type StakeLevel = "Casual Play" | "Competitive" | "High Roller";
export type TableStatus = "waiting" | "in-progress" | "finished";
export type TableVisibility = "public" | "private";

export interface ITablePlayer {
  userId: string;
  username: string;
  socketId?: string;
}

export interface ITable extends Document {
  tableNumber: number;
  maxPlayers: number;
  players: ITablePlayer[];
  status: TableStatus;
  visibility: TableVisibility;
  stakes: StakeLevel;
  inviteCode?: string; // only set for private rooms
  gameId?: string;     // reference to the active Game document
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: { type: Number, required: true, unique: true },
    maxPlayers: { type: Number, enum: [2, 4], default: 2 },
    players: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        socketId: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["waiting", "in-progress", "finished"],
      default: "waiting",
    },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    stakes: {
      type: String,
      enum: ["Casual Play", "Competitive", "High Roller"],
      default: "Casual Play",
    },
    inviteCode: { type: String, select: false }, // hidden unless explicitly requested
    gameId: { type: String },
  },
  { timestamps: true }
);

// Auto-increment tableNumber before validation so the required check passes
TableSchema.pre("validate", async function () {
  if (!this.isNew) return;
  const last = await mongoose.model("Table").findOne({}, {}, { sort: { tableNumber: -1 } });
  this.tableNumber = last ? last.tableNumber + 1 : 1;
});

export const Table = mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);
