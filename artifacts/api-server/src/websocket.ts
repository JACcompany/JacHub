import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "http";
import { db, mensajesChatTable, usuariosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

type AuthWS = WebSocket & {
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  sala: string;
  isAlive: boolean;
};

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(";").forEach(c => {
    const [k, ...v] = c.trim().split("=");
    if (k) out[k.trim()] = decodeURIComponent(v.join("=").trim());
  });
  return out;
}

function broadcast(wss: WebSocketServer, sala: string, data: object, exclude: WebSocket | null) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    const c = client as AuthWS;
    if (c !== exclude && c.sala === sala && c.readyState === WebSocket.OPEN) {
      c.send(payload);
    }
  });
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (req: IncomingMessage, socket: any, head: any) => {
    if (!req.url?.startsWith("/api/ws/chat")) {
      socket.destroy();
      return;
    }

    const cookies = parseCookies(req.headers.cookie ?? "");
    const sessionId = cookies["session_usuario_id"];
    if (!sessionId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const [usuario] = await db.select().from(usuariosTable).where(eq(usuariosTable.id, parseInt(sessionId, 10)));
    if (!usuario) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const sala = url.searchParams.get("sala") ?? "general";

    wss.handleUpgrade(req, socket, head, ws => {
      const authWs = ws as AuthWS;
      authWs.usuarioId = usuario.id;
      authWs.usuarioNombre = usuario.nombre;
      authWs.usuarioEmail = usuario.email;
      authWs.sala = sala;
      authWs.isAlive = true;
      wss.emit("connection", authWs, req);
    });
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach(ws => {
      const c = ws as AuthWS;
      if (!c.isAlive) { c.terminate(); return; }
      c.isAlive = false;
      c.ping();
    });
  }, 30_000);

  wss.on("connection", (ws, _req) => {
    const authWs = ws as AuthWS;
    logger.info({ sala: authWs.sala, usuario: authWs.usuarioNombre }, "WS connected");

    broadcast(wss, authWs.sala, {
      tipo: "sistema",
      mensaje: `${authWs.usuarioNombre} se conectó`,
      sala: authWs.sala,
    }, null);

    authWs.on("pong", () => { authWs.isAlive = true; });

    authWs.on("message", async data => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.tipo !== "mensaje" || !String(msg.contenido ?? "").trim()) return;

        const contenido = String(msg.contenido).slice(0, 2000).trim();
        const [saved] = await db.insert(mensajesChatTable).values({
          contenido,
          autorId: authWs.usuarioId,
          autorNombre: authWs.usuarioNombre,
          autorEmail: authWs.usuarioEmail,
          sala: authWs.sala,
        }).returning();

        broadcast(wss, authWs.sala, {
          tipo: "mensaje",
          id: saved.id,
          contenido: saved.contenido,
          autorNombre: saved.autorNombre,
          autorEmail: saved.autorEmail,
          sala: saved.sala,
          fechaEnvio: saved.fechaEnvio.toISOString(),
        }, null);
      } catch { /* ignore malformed */ }
    });

    authWs.on("close", () => {
      broadcast(wss, authWs.sala, {
        tipo: "sistema",
        mensaje: `${authWs.usuarioNombre} se desconectó`,
        sala: authWs.sala,
      }, null);
    });

    authWs.on("error", err => {
      logger.warn({ err }, "WS error");
    });
  });

  wss.on("close", () => clearInterval(heartbeat));
  return wss;
}
