import { Router, type IRouter } from "express";
import { eq, and, gte, count } from "drizzle-orm";
import { db, proyectosTable, tareasTable, bugsTable, miembrosTable, buildsTable, actividadTable } from "@workspace/db";

const router: IRouter = Router();

// Estadísticas generales del dashboard
router.get("/dashboard/stats", async (req, res): Promise<void> => {
  // Proyectos activos
  const [{ value: proyectosActivos }] = await db
    .select({ value: count() })
    .from(proyectosTable)
    .where(eq(proyectosTable.estado, "Activo"));

  // Miembros conectados (en línea)
  const [{ value: miembrosConectados }] = await db
    .select({ value: count() })
    .from(miembrosTable)
    .where(eq(miembrosTable.enLinea, true));

  // Bugs abiertos
  const [{ value: bugsAbiertos }] = await db
    .select({ value: count() })
    .from(bugsTable)
    .where(eq(bugsTable.estado, "Abierto"));

  // Total de tareas
  const [{ value: totalTareas }] = await db
    .select({ value: count() })
    .from(tareasTable);

  // Tareas completadas esta semana
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

  // Total de builds
  const [{ value: totalBuilds }] = await db
    .select({ value: count() })
    .from(buildsTable);

  // Progreso por proyecto
  const proyectos = await db
    .select({ nombre: proyectosTable.nombre, progreso: proyectosTable.progreso })
    .from(proyectosTable)
    .where(eq(proyectosTable.estado, "Activo"));

  const progresoPorProyecto = proyectos.map(p => ({
    nombre: p.nombre,
    progreso: p.progreso,
  }));

  // Bugs por prioridad
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

  // Actividad semanal simulada con conteo diario
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const actividadSemanal = dias.map((dia, i) => ({
    dia,
    tareas: Math.floor(Math.random() * 8) + 1,
    bugs: Math.floor(Math.random() * 5),
  }));

  res.json({
    proyectosActivos: Number(proyectosActivos),
    miembrosConectados: Number(miembrosConectados),
    bugsAbiertos: Number(bugsAbiertos),
    tareasCompletadasSemana: Number(tareasCompletadasSemana),
    totalTareas: Number(totalTareas),
    totalBuilds: Number(totalBuilds),
    progresoPorProyecto,
    bugsPorPrioridad,
    actividadSemanal,
  });
});

// Feed de actividad reciente
router.get("/dashboard/actividad", async (req, res): Promise<void> => {
  const actividad = await db
    .select()
    .from(actividadTable)
    .orderBy(actividadTable.fecha)
    .limit(20);

  res.json(actividad.map(a => ({
    id: a.id,
    mensaje: a.mensaje,
    tipo: a.tipo,
    fecha: a.fecha.toISOString(),
    usuario: a.usuario,
    avatar: a.avatar,
  })));
});

export default router;
