import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificacionesTable } from "@workspace/db";
import {
  MarcarNotificacionLeidaParams,
  ListNotificacionesResponse,
  MarcarNotificacionLeidaResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Listar notificaciones (las más recientes primero)
router.get("/notificaciones", async (req, res): Promise<void> => {
  const notificaciones = await db
    .select()
    .from(notificacionesTable)
    .orderBy(notificacionesTable.fecha);

  res.json(ListNotificacionesResponse.parse(notificaciones.map(n => ({
    ...n,
    fecha: n.fecha.toISOString(),
  }))));
});

// Marcar notificación individual como leída
router.patch("/notificaciones/:id/leer", async (req, res): Promise<void> => {
  const params = MarcarNotificacionLeidaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [notif] = await db
    .update(notificacionesTable)
    .set({ leida: true })
    .where(eq(notificacionesTable.id, params.data.id))
    .returning();

  if (!notif) {
    res.status(404).json({ error: "Notificación no encontrada" });
    return;
  }

  res.json(MarcarNotificacionLeidaResponse.parse({
    ...notif,
    fecha: notif.fecha.toISOString(),
  }));
});

// Marcar todas las notificaciones como leídas
router.patch("/notificaciones/leer-todas", async (req, res): Promise<void> => {
  await db
    .update(notificacionesTable)
    .set({ leida: true });

  res.json({ ok: true });
});

export default router;
