import mongoose, { Document, Schema } from "mongoose";

export interface IUserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  totalTurns: number;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  stats: IUserStats;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false prevents password from being returned in queries by default
    password: { type: String, required: true, select: false },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      totalTurns: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
