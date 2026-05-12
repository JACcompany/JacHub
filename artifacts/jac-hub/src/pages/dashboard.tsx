import { useGetDashboardStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Kanban, Users, Bug, CheckCircle2, Package, Loader2, BarChart2 } from "lucide-react";

const COLORS = ['#ff0055', '#ff7a00', '#ffcc00', '#00ff88'];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Dashboard</h1>
          <p className="text-muted-foreground">Estado general del estudio JAC.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Proyectos Activos</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground">{stats.proyectosActivos}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                    <Kanban className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Miembros Conectados</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground">{stats.miembrosConectados}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bugs Abiertos</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground">{stats.bugsAbiertos}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
                    <Bug className="h-6 w-6 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Builds</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground">{stats.totalBuilds}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos reales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bugs por Prioridad */}
              {stats.bugsPorPrioridad && stats.bugsPorPrioridad.some(b => b.cantidad > 0) ? (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-primary" />
                      Bugs por Prioridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.bugsPorPrioridad.filter(b => b.cantidad > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="cantidad"
                          nameKey="prioridad"
                          stroke="none"
                        >
                          {stats.bugsPorPrioridad.filter(b => b.cantidad > 0).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-primary" />
                      Bugs por Prioridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[280px] text-center">
                    <Bug className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No hay bugs registrados</p>
                  </CardContent>
                </Card>
              )}

              {/* Progreso de Proyectos */}
              {stats.progresoPorProyecto && stats.progresoPorProyecto.length > 0 ? (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      Progreso de Proyectos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.progresoPorProyecto} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="#888" tickFormatter={(v) => `${v}%`} />
                        <YAxis dataKey="nombre" type="category" stroke="#888" width={90} tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          formatter={(v) => [`${v}%`, "Progreso"]}
                        />
                        <Bar dataKey="progreso" fill="#00ff88" radius={[0, 4, 4, 0]} name="Progreso (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      Progreso de Proyectos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[280px] text-center">
                    <Kanban className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No hay proyectos activos registrados</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tareas esta semana */}
            <Card className="border-primary/20 bg-card/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tareas Completadas esta Semana</p>
                  <h3 className="text-3xl font-bold mt-2 text-foreground">{stats.tareasCompletadasSemana}</h3>
                  <p className="text-xs text-muted-foreground mt-1">de {stats.totalTareas} tareas totales</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/20">
            <BarChart2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Sin datos disponibles</h3>
            <p className="text-muted-foreground mt-2">No hay información que mostrar en el dashboard.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
