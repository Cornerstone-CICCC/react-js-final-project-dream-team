import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      stats: user.stats,
      createdAt: user.createdAt,
    },
  });
}
