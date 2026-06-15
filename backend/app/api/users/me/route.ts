import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json();
  const username: string = (body.username ?? "").trim();

  if (!username) {
    return NextResponse.json({ error: "Username cannot be empty." }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ username, _id: { $ne: session.userId } });
  if (existing) {
    return NextResponse.json({ message: "Username already taken." }, { status: 409 });
  }

  const user = await User.findByIdAndUpdate(
    session.userId,
    { username },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}
