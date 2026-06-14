import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import zxcvbn from "zxcvbn";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, createAuthCookie } from "@/lib/auth";
import { validateRegister } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username: string = body.username?.trim() ?? "";
    const email: string = body.email?.trim().toLowerCase() ?? "";
    const password: string = body.password ?? "";

    // Step 1 — structural validation
    const fieldErrors = validateRegister({ username, email, password });
    if (fieldErrors.length > 0) {
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    // Step 2 — password strength (zxcvbn score: 0-4, require ≥ 2)
    const strength = zxcvbn(password, [username, email]);
    if (strength.score < 2) {
      return NextResponse.json(
        {
          errors: [{ field: "password", message: "Password is too weak." }],
          passwordFeedback: {
            score: strength.score,
            warning: strength.feedback.warning,
            suggestions: strength.feedback.suggestions,
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Step 3 — uniqueness check
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return NextResponse.json(
        { errors: [{ field, message: `That ${field} is already in use.` }] },
        { status: 409 }
      );
    }

    // Step 4 — hash and create
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed });

    const token = signToken({ userId: user._id.toString(), username: user.username });
    const cookie = createAuthCookie(token);

    const res = NextResponse.json(
      {
        message: "Account created.",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          stats: user.stats,
        },
      },
      { status: 201 }
    );
    res.cookies.set(cookie);
    return res;
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
