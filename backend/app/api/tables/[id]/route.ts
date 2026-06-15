import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";
import { requireAuth } from "@/lib/middleware";

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/tables/[id]
 * Fetch a single table. Public tables are open; private tables require auth.
 */
export async function GET(_req: NextRequest, context: Context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ error: "Table not found." }, { status: 404 });
    }
    return NextResponse.json({ table });
  } catch (err) {
    console.error("[GET /api/tables/[id]]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * POST /api/tables/[id]/join
 * Handled in the nested route file — see join/route.ts
 */

/**
 * DELETE /api/tables/[id]
 * Remove a table that hasn't started yet (creator only).
 */
export const DELETE = requireAuth(async (_req, context, session) => {
  try {
    await connectDB();
    const { id } = context.params;
    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json({ error: "Table not found." }, { status: 404 });
    }
    if (table.players[0]?.userId !== session.userId) {
      return NextResponse.json({ error: "Only the table creator can delete it." }, { status: 403 });
    }

    await table.deleteOne();
    return NextResponse.json({ message: "Table deleted." });
  } catch (err) {
    console.error("[DELETE /api/tables/[id]]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
});
