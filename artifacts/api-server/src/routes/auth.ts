import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Iniciar sesión — comparación simple sin hash para demo
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [usuario] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.email, email));

  if (!usuario || usuario.password !== password) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  // Marcar como en línea
  await db
    .update(usuariosTable)
    .set({ enLinea: true })
    .where(eq(usuariosTable.id, usuario.id));

  // Guardar sesión en cookie simple
  (req as any).session = { usuarioId: usuario.id };
  res.cookie("session_usuario_id", String(usuario.id), {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      avatar: usuario.avatar,
      enLinea: true,
    },
    token: `demo-token-${usuario.id}`,
  });
});

// Cerrar sesión
router.post("/auth/logout", async (req, res): Promise<void> => {
  const usuarioId = req.cookies?.session_usuario_id;
  if (usuarioId) {
    await db
      .update(usuariosTable)
      .set({ enLinea: false })
      .where(eq(usuariosTable.id, parseInt(usuarioId, 10)));
  }
  res.clearCookie("session_usuario_id");
  res.json({ ok: true });
});

// Obtener usuario actual por cookie
router.get("/auth/me", async (req, res): Promise<void> => {
  const usuarioId = req.cookies?.session_usuario_id;
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const [usuario] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.id, parseInt(usuarioId, 10)));

  if (!usuario) {
    res.clearCookie("session_usuario_id");
    res.status(401).json({ error: "Sesión expirada" });
    return;
  }

  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    avatar: usuario.avatar,
    enLinea: usuario.enLinea,
  });
});

export default router;
