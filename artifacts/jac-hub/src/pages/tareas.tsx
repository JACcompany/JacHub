import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTareas, useCreateTarea, useUpdateTarea, useDeleteTarea, getListTareasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ListTodo, Lock } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-admin";

const COLUMNAS = ["Ideas", "Pendiente", "En Progreso", "Testing", "Completado"];

export default function Tareas() {
  const { data: tareas, isLoading } = useListTareas();
  const createMutation = useCreateTarea();
  const updateMutation = useUpdateTarea();
  const deleteMutation = useDeleteTarea();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({ titulo: "", descripcion: "", columna: "Pendiente", prioridad: "Media", asignadoA: "" });
  const [draggedTareaId, setDraggedTareaId] = useState<number | null>(null);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case "crítica": return "bg-destructive text-destructive-foreground";
      case "alta": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "media": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "baja": return "bg-primary/20 text-primary border-primary/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: nuevaTarea }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTareasQueryKey() });
        setIsCreateOpen(false);
        setNuevaTarea({ titulo: "", descripcion: "", columna: "Pendiente", prioridad: "Media", asignadoA: "" });
        toast({ title: "Tarea registrada en el sistema" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTareasQueryKey() });
        toast({ title: "Tarea eliminada" });
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    if (!isAdmin) return;
    setDraggedTareaId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnaDestino: string) => {
    e.preventDefault();
    if (!isAdmin || draggedTareaId === null) return;
    const tarea = tareas?.find(t => t.id === draggedTareaId);
    if (tarea && tarea.columna !== columnaDestino) {
      queryClient.setQueryData(getListTareasQueryKey(), (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(t => t.id === draggedTareaId ? { ...t, columna: columnaDestino } : t);
      });
      updateMutation.mutate({ id: draggedTareaId, data: { columna: columnaDestino } }, {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: getListTareasQueryKey() });
          toast({ title: "Error al mover tarea", variant: "destructive" });
        }
      });
    }
    setDraggedTareaId(null);
  };

  const tareasPorColumna = COLUMNAS.reduce((acc, col) => {
    acc[col] = tareas?.filter(t => t.columna === col) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <AppLayout>
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Kanban</h1>
            <p className="text-muted-foreground">Flujo de trabajo y asignación de tareas.</p>
          </div>

          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                  <Plus className="h-4 w-4" /> Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-primary/20 bg-card">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Añadir Tarea</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input id="titulo" value={nuevaTarea.titulo} onChange={e => setNuevaTarea({...nuevaTarea, titulo: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea id="descripcion" value={nuevaTarea.descripcion} onChange={e => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})} rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Columna</Label>
                        <Select value={nuevaTarea.columna} onValueChange={v => setNuevaTarea({...nuevaTarea, columna: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{COLUMNAS.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Prioridad</Label>
                        <Select value={nuevaTarea.prioridad} onValueChange={v => setNuevaTarea({...nuevaTarea, prioridad: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baja">Baja</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Crítica">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="asignadoA">Asignar a (opcional)</Label>
                      <Input id="asignadoA" value={nuevaTarea.asignadoA} onChange={e => setNuevaTarea({...nuevaTarea, asignadoA: e.target.value})} placeholder="Nombre del miembro..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear Tarea
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border/30 rounded-md px-3 py-2 bg-card/30">
            <Lock className="h-3.5 w-3.5" />
            <span>Modo lectura — solo el administrador puede crear, mover o eliminar tareas.</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12 flex-1 items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tareas && tareas.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/20">
            <ListTodo className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No existen tareas actualmente</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              {isAdmin ? "Crea la primera tarea para comenzar el flujo de trabajo." : "El administrador aún no ha registrado tareas."}
            </p>
            {isAdmin && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
              </Button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
            {COLUMNAS.map(columna => (
              <div
                key={columna}
                className="w-80 min-w-[320px] flex flex-col bg-card/30 border border-border/50 rounded-lg overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columna)}
              >
                <div className="p-3 border-b border-border/50 bg-card/50 flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">{columna}</h3>
                  <Badge variant="secondary" className="bg-background">{tareasPorColumna[columna]?.length || 0}</Badge>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {tareasPorColumna[columna]?.map(tarea => (
                    <Card
                      key={tarea.id}
                      className={`border-border/60 bg-card group shadow-sm transition-colors ${isAdmin ? 'hover:border-primary/40 cursor-grab active:cursor-grabbing' : 'hover:border-primary/20'}`}
                      draggable={isAdmin}
                      onDragStart={(e) => handleDragStart(e, tarea.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-medium text-sm leading-tight line-clamp-2">{tarea.titulo}</h4>
                          <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 border-transparent flex-shrink-0 ${getPrioridadColor(tarea.prioridad)}`}>
                            {tarea.prioridad.charAt(0)}
                          </Badge>
                        </div>
                        {tarea.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{tarea.descripcion}</p>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                          {tarea.asignadoA ? (
                            <div className="text-xs text-secondary font-medium px-1.5 py-0.5 bg-secondary/10 rounded">{tarea.asignadoA}</div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Sin asignar</div>
                          )}
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-destructive/20 bg-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                                  <AlertDialogDescription>Se eliminará "{tarea.titulo}". Esta acción no se puede deshacer.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(tarea.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tareasPorColumna[columna]?.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg text-muted-foreground/50 text-sm">
                      Columna vacía
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
