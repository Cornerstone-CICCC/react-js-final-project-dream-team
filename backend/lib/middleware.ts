import { NextRequest, NextResponse } from "next/server";
import { getSession, JwtPayload } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (
  req: NextRequest,
  // Next.js 15 passes params as a Promise in route handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: { params: any },
  session: JwtPayload
) => Promise<NextResponse>;

/**
 * Wraps a route handler and ensures the request is authenticated.
 * If the JWT cookie is missing or invalid the handler is never called
 * and a 401 is returned immediately.
 *
 * Usage:
 *   export const POST = requireAuth(async (req, context, session) => { ... });
 */
export function requireAuth(handler: RouteHandler) {
  return async (
    req: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: { params: any }
  ): Promise<NextResponse> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return handler(req, context, session);
  };
}
