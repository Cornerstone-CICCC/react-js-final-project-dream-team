import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, createAuthCookie } from "@/lib/auth";
import { isValidEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept either "identifier" (username or email) or legacy "email" field
    const identifier: string = (body.identifier ?? body.email ?? "").trim();
    const password: string = body.password ?? "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Look up by email if identifier looks like one, otherwise by username
    const query = isValidEmail(identifier)
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const user = await User.findOne(query).select("+password");
    if (!user) {
      // Generic message to avoid leaking whether the account exists
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), username: user.username });
    const cookie = createAuthCookie(token);

    const res = NextResponse.json({
      message: "Logged in.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        stats: user.stats,
      },
    });
    res.cookies.set(cookie);
    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
