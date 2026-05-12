import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListBugs, useCreateBug, useUpdateBug, useDeleteBug, getListBugsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bug as BugIcon, Plus, Search, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Bugs() {
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("all");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [busqueda, setBusqueda] = useState("");
  
  const queryParams = {
    ...(filtroPrioridad !== "all" && { prioridad: filtroPrioridad }),
    ...(filtroEstado !== "all" && { estado: filtroEstado })
  };

  const { data: bugs, isLoading } = useListBugs(queryParams);
  const createMutation = useCreateBug();
  const updateMutation = useUpdateBug();
  const deleteMutation = useDeleteBug();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nuevoBug, setNuevoBug] = useState({ titulo: "", descripcion: "", prioridad: "Media", proyectoId: undefined as number | undefined });

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case "crítica": return "bg-destructive text-destructive-foreground";
      case "alta": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "media": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "baja": return "bg-primary/20 text-primary border-primary/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "abierto": return "text-destructive border-destructive/30";
      case "en progreso": return "text-secondary border-secondary/30";
      case "resuelto": return "text-primary border-primary/30";
      case "cerrado": return "text-muted-foreground border-border";
      default: return "text-muted-foreground";
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: nuevoBug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBugsQueryKey(queryParams) });
        setIsCreateOpen(false);
        setNuevoBug({ titulo: "", descripcion: "", prioridad: "Media", proyectoId: undefined });
        toast({ title: "Bug reportado exitosamente" });
      }
    });
  };

  const handleResolve = (id: number) => {
    updateMutation.mutate({ id, data: { estado: "Resuelto" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBugsQueryKey(queryParams) });
        toast({ title: "Bug marcado como resuelto" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBugsQueryKey(queryParams) });
        toast({ title: "Bug purgado del sistema" });
      }
    });
  };

  const filteredBugs = bugs?.filter(b => b.titulo.toLowerCase().includes(busqueda.toLowerCase()) || b.descripcion?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Registro de Bugs</h1>
            <p className="text-muted-foreground">Rastreo y resolución de anomalías en el sistema.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                <Plus className="h-4 w-4" /> Reportar Bug
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-primary/20 bg-card">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Reportar Nueva Anomalía</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input id="titulo" value={nuevoBug.titulo} onChange={e => setNuevoBug({...nuevoBug, titulo: e.target.value})} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea id="descripcion" value={nuevoBug.descripcion} onChange={e => setNuevoBug({...nuevoBug, descripcion: e.target.value})} rows={3} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prioridad">Prioridad</Label>
                    <Select value={nuevoBug.prioridad} onValueChange={v => setNuevoBug({...nuevoBug, prioridad: v})}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar anomalías..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9 bg-background/50 border-primary/20"
            />
          </div>
          <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="Crítica">Crítica</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Baja">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Abierto">Abierto</SelectItem>
              <SelectItem value="En Progreso">En Progreso</SelectItem>
              <SelectItem value="Resuelto">Resuelto</SelectItem>
              <SelectItem value="Cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBugs && filteredBugs.length > 0 ? (
          <div className="space-y-4">
            {filteredBugs.map(bug => (
              <Card key={bug.id} className="border-border hover:border-primary/30 transition-colors bg-card/80">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="mt-1">
                    <BugIcon className={`h-5 w-5 ${bug.estado === 'Resuelto' ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg leading-none">{bug.titulo}</h3>
                      <Badge variant="outline" className={getPrioridadColor(bug.prioridad)}>{bug.prioridad}</Badge>
                      <Badge variant="outline" className={getEstadoColor(bug.estado)}>{bug.estado}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{bug.descripcion}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                      <span>Reportado: {format(new Date(bug.fechaReporte), "dd MMM yyyy", { locale: es })}</span>
                      {bug.asignadoA && <span>Asignado a: <span className="text-primary/80">{bug.asignadoA}</span></span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {bug.estado !== "Resuelto" && bug.estado !== "Cerrado" && (
                      <Button variant="outline" size="sm" className="h-8 border-primary/30 hover:bg-primary/10 hover:text-primary text-xs" onClick={() => handleResolve(bug.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(bug.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/20">
            <BugIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">Sistema Estable</h3>
            <p className="text-muted-foreground mt-2">No se encontraron anomalías con los filtros actuales.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}