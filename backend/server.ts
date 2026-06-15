import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import { parse as parseCookie } from "cookie";
import { verifyToken } from "./lib/auth";
import { registerGameHandlers } from "./lib/socket/gameHandlers";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── Socket authentication middleware ──────────────────────────────────────
  // Verify the JWT cookie before allowing any socket connection.
  // Authenticated user data is stored on socket.data so handlers can trust it.
  io.use((socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const cookies = parseCookie(cookieHeader);
      const token = cookies["rummy_token"];

      if (!token) {
        return next(new Error("Authentication required."));
      }

      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      socket.data.username = payload.username;
      next();
    } catch {
      next(new Error("Invalid or expired session."));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id, "user:", socket.data.userId);
    registerGameHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Backend ready on http://localhost:${PORT}`);
  });
});
