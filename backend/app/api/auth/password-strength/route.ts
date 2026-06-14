import { NextRequest, NextResponse } from "next/server";
import zxcvbn from "zxcvbn";

/**
 * GET /api/auth/password-strength?password=...&username=...&email=...
 *
 * Returns a zxcvbn score and human-readable feedback so the frontend
 * can show a live strength indicator while the user types.
 *
 * Score meanings:
 *   0 — too guessable (risky password)
 *   1 — very guessable
 *   2 — somewhat guessable (minimum we accept on register)
 *   3 — safely unguessable
 *   4 — very unguessable
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password") ?? "";
  const username = searchParams.get("username") ?? "";
  const email = searchParams.get("email") ?? "";

  if (!password) {
    return NextResponse.json({ error: "password query param is required." }, { status: 400 });
  }

  // Pass username and email as user inputs so zxcvbn penalises obvious patterns
  const userInputs = [username, email].filter(Boolean);
  const result = zxcvbn(password, userInputs);

  return NextResponse.json({
    score: result.score,             // 0–4
    acceptable: result.score >= 2,   // matches the register rule
    feedback: {
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
    },
    crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
  });
}
