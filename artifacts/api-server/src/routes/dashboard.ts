import { Router, type IRouter } from "express";
import { eq, and, gte, count } from "drizzle-orm";
import { db, proyectosTable, tareasTable, bugsTable, miembrosTable, buildsTable } from "@workspace/db";
import { requireAuth } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const [{ value: proyectosActivos }] = await db
    .select({ value: count() })
    .from(proyectosTable)
    .where(eq(proyectosTable.estado, "Activo"));

  const [{ value: miembrosConectados }] = await db
    .select({ value: count() })
    .from(miembrosTable)
    .where(eq(miembrosTable.enLinea, true));

  const [{ value: bugsAbiertos }] = await db
    .select({ value: count() })
    .from(bugsTable)
    .where(eq(bugsTable.estado, "Abierto"));

  const [{ value: totalTareas }] = await db
    .select({ value: count() })
    .from(tareasTable);

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);
  const [{ value: tareasCompletadasSemana }] = await db
    .select({ value: count() })
    .from(tareasTable)
    .where(
      and(
        eq(tareasTable.columna, "Completado"),
        gte(tareasTable.fechaCreacion, inicioSemana)
      )
    );

  const [{ value: totalBuilds }] = await db
    .select({ value: count() })
    .from(buildsTable);

  const proyectos = await db
    .select({ nombre: proyectosTable.nombre, progreso: proyectosTable.progreso })
    .from(proyectosTable)
    .where(eq(proyectosTable.estado, "Activo"));

  const progresoPorProyecto = proyectos.map(p => ({
    nombre: p.nombre,
    progreso: p.progreso,
  }));

  const todasPrioridades = ["Crítica", "Alta", "Media", "Baja"];
  const bugsPorPrioridad = await Promise.all(
    todasPrioridades.map(async (prioridad) => {
      const [{ value: cantidad }] = await db
        .select({ value: count() })
        .from(bugsTable)
        .where(eq(bugsTable.prioridad, prioridad));
      return { prioridad, cantidad: Number(cantidad) };
    })
  );

  res.json({
    proyectosActivos: Number(proyectosActivos),
    miembrosConectados: Number(miembrosConectados),
    bugsAbiertos: Number(bugsAbiertos),
    tareasCompletadasSemana: Number(tareasCompletadasSemana),
    totalTareas: Number(totalTareas),
    totalBuilds: Number(totalBuilds),
    progresoPorProyecto,
    bugsPorPrioridad,
  });
});

export default router;
