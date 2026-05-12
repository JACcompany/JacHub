import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tareasTable } from "@workspace/db";
import {
  CreateTareaBody,
  UpdateTareaBody,
  UpdateTareaParams,
  DeleteTareaParams,
  ListTareasQueryParams,
  ListTareasResponse,
  UpdateTareaResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Listar tareas con filtros opcionales
router.get("/tareas", async (req, res): Promise<void> => {
  const qp = ListTareasQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  const conditions = [];
  if (qp.data.proyectoId != null) {
    conditions.push(eq(tareasTable.proyectoId, qp.data.proyectoId));
  }
  if (qp.data.columna) {
    conditions.push(eq(tareasTable.columna, qp.data.columna));
  }

  const tareas = conditions.length > 0
    ? await db.select().from(tareasTable).where(and(...conditions)).orderBy(tareasTable.fechaCreacion)
    : await db.select().from(tareasTable).orderBy(tareasTable.fechaCreacion);

  res.json(ListTareasResponse.parse(tareas.map(t => ({
    ...t,
    fechaCreacion: t.fechaCreacion.toISOString(),
    fechaLimite: t.fechaLimite ? t.fechaLimite.toISOString() : null,
  }))));
});

// Crear tarea
router.post("/tareas", async (req, res): Promise<void> => {
  const parsed = CreateTareaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fechaLimite, ...rest } = parsed.data;
  const [tarea] = await db.insert(tareasTable).values({
    ...rest,
    ...(fechaLimite ? { fechaLimite: new Date(fechaLimite) } : {}),
  }).returning();

  res.status(201).json({
    ...tarea,
    fechaCreacion: tarea.fechaCreacion.toISOString(),
    fechaLimite: tarea.fechaLimite ? tarea.fechaLimite.toISOString() : null,
  });
});

// Actualizar tarea (también usada para mover entre columnas del Kanban)
router.patch("/tareas/:id", async (req, res): Promise<void> => {
  const params = UpdateTareaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTareaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fechaLimite: fl, ...restUpdate } = parsed.data;
  const [tarea] = await db
    .update(tareasTable)
    .set({ ...restUpdate, ...(fl ? { fechaLimite: new Date(fl) } : {}) })
    .where(eq(tareasTable.id, params.data.id))
    .returning();

  if (!tarea) {
    res.status(404).json({ error: "Tarea no encontrada" });
    return;
  }

  res.json(UpdateTareaResponse.parse({
    ...tarea,
    fechaCreacion: tarea.fechaCreacion.toISOString(),
    fechaLimite: tarea.fechaLimite ? tarea.fechaLimite.toISOString() : null,
  }));
});

// Eliminar tarea
router.delete("/tareas/:id", async (req, res): Promise<void> => {
  const params = DeleteTareaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tarea] = await db
    .delete(tareasTable)
    .where(eq(tareasTable.id, params.data.id))
    .returning();

  if (!tarea) {
    res.status(404).json({ error: "Tarea no encontrada" });
    return;
  }

  res.sendStatus(204);
});

export default router;
