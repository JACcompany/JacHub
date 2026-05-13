import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListProyectos, useListTareas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Film, ChevronRight, Clapperboard } from "lucide-react";

const COLUMNA_ESCENA: Record<string, { emoji: string; color: string }> = {
  "Ideas":       { emoji: "💡", color: "border-purple-500/40 text-purple-400" },
  "Pendiente":   { emoji: "⏳", color: "border-border/40 text-muted-foreground" },
  "En Progreso": { emoji: "⚡", color: "border-secondary/40 text-secondary" },
  "Testing":     { emoji: "🔍", color: "border-orange-400/40 text-orange-400" },
  "Completado":  { emoji: "✅", color: "border-primary/40 text-primary" },
};

const PRIORIDAD_COLOR: Record<string, string> = {
  "Crítica": "bg-destructive/20 text-destructive border-destructive/30",
  "Alta":    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Media":   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Baja":    "bg-primary/10 text-primary border-primary/20",
};

export default function Storyboard() {
  const { data: proyectos, isLoading: loadingProj } = useListProyectos();
  const { data: tareas, isLoading: loadingTar } = useListTareas();
  const [proyectoFiltro, setProyectoFiltro] = useState<string>("todos");
  const [columnaFiltro, setColumnaFiltro] = useState<string>("todas");

  const proyectosConTareas = useMemo(() => {
    if (!proyectos || !tareas) return [];
    return proyectos
      .filter(p => proyectoFiltro === "todos" || String(p.id) === proyectoFiltro)
      .map(p => ({
        ...p,
        escenas: tareas
          .filter(t => t.proyectoId === p.id && (columnaFiltro === "todas" || t.columna === columnaFiltro))
          .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()),
      }))
      .filter(p => p.escenas.length > 0);
  }, [proyectos, tareas, proyectoFiltro, columnaFiltro]);

  const tareasHuerfanas = useMemo(() => {
    if (!tareas) return [];
    return tareas.filter(t =>
      !t.proyectoId &&
      (columnaFiltro === "todas" || t.columna === columnaFiltro)
    );
  }, [tareas, columnaFiltro]);

  const isLoading = loadingProj || loadingTar;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary uppercase flex items-center gap-2">
              <Film className="h-7 w-7" />
              Storyboard
            </h1>
            <p className="text-muted-foreground">Vista narrativa visual del desarrollo del juego.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={proyectoFiltro} onValueChange={setProyectoFiltro}>
              <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                <SelectValue placeholder="Filtrar proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proyectos</SelectItem>
                {proyectos?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={columnaFiltro} onValueChange={setColumnaFiltro}>
              <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                {Object.keys(COLUMNA_ESCENA).map(col => (
                  <SelectItem key={col} value={col}>{COLUMNA_ESCENA[col].emoji} {col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : proyectosConTareas.length === 0 && tareasHuerfanas.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/20">
            <Clapperboard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay escenas para mostrar</h3>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
              Asigna tareas a proyectos para que aparezcan como escenas del storyboard.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {proyectosConTareas.map((proyecto, proyIdx) => (
              <div key={proyecto.id}>
                {/* Act header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-card/60 border border-border/50 rounded-lg px-4 py-2">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                      ACTO {proyIdx + 1}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-bold text-foreground">{proyecto.nombre}</span>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-1">
                      {proyecto.escenas.length} escenas
                    </Badge>
                    {proyecto.estado && (
                      <Badge variant="secondary" className="text-[10px]">{proyecto.estado}</Badge>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* Storyboard reel */}
                <div className="flex gap-4 overflow-x-auto pb-4 pl-2">
                  {proyecto.escenas.map((escena, escIdx) => {
                    const cfg = COLUMNA_ESCENA[escena.columna] ?? COLUMNA_ESCENA["Pendiente"];
                    return (
                      <div key={escena.id} className="flex items-start gap-2 flex-shrink-0">
                        {/* Scene card */}
                        <Card className={`w-48 border ${cfg.color} bg-card/40 hover:bg-card/60 transition-colors`}>
                          {/* Frame */}
                          <div className="aspect-video bg-background/40 border-b border-border/30 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-5">
                              <div className="grid grid-cols-4 h-full">
                                {Array.from({length: 4}).map((_, i) => (
                                  <div key={i} className="border-r border-muted-foreground" />
                                ))}
                              </div>
                              {Array.from({length: 3}).map((_, i) => (
                                <div key={i} className="absolute w-full border-b border-muted-foreground" style={{ top: `${(i+1)*33.3}%` }} />
                              ))}
                            </div>
                            <div className="relative text-center px-2">
                              <span className="text-3xl">{cfg.emoji}</span>
                              <p className="text-[9px] text-muted-foreground/60 font-mono mt-1">
                                {escena.columna.toUpperCase()}
                              </p>
                            </div>
                            <div className="absolute top-1 left-1 bg-black/60 rounded text-[9px] font-mono px-1 text-primary">
                              #{String(escIdx + 1).padStart(2, "0")}
                            </div>
                          </div>
                          <CardContent className="p-2.5">
                            <p className="text-xs font-semibold line-clamp-2 leading-snug">{escena.titulo}</p>
                            {escena.descripcion && (
                              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{escena.descripcion}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              {escena.asignadoA ? (
                                <span className="text-[9px] text-secondary/80 truncate">{escena.asignadoA}</span>
                              ) : (
                                <span className="text-[9px] text-muted-foreground/50">sin asignar</span>
                              )}
                              <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3 ${PRIORIDAD_COLOR[escena.prioridad] ?? ''}`}>
                                {escena.prioridad[0]}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Connector arrow */}
                        {escIdx < proyecto.escenas.length - 1 && (
                          <div className="flex items-center self-center mt-4 text-border/50">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Orphan tasks (no project) */}
            {tareasHuerfanas.length > 0 && proyectoFiltro === "todos" && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-card/40 border border-dashed border-border/40 rounded-lg px-4 py-2">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">SIN PROYECTO</span>
                    <Badge variant="secondary" className="text-[10px]">{tareasHuerfanas.length}</Badge>
                  </div>
                  <div className="flex-1 h-px bg-border/20" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 pl-2">
                  {tareasHuerfanas.map((escena, i) => {
                    const cfg = COLUMNA_ESCENA[escena.columna] ?? COLUMNA_ESCENA["Pendiente"];
                    return (
                      <Card key={escena.id} className={`w-40 border ${cfg.color} bg-card/30 flex-shrink-0`}>
                        <div className="aspect-video bg-background/30 border-b border-border/20 flex items-center justify-center">
                          <span className="text-2xl opacity-60">{cfg.emoji}</span>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-[10px] font-medium line-clamp-2">{escena.titulo}</p>
                          <p className="text-[9px] text-muted-foreground/50 mt-1">{escena.columna}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
