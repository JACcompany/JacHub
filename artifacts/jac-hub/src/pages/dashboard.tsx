import { useGetDashboardStats, useGetDashboardActividad } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Kanban, Users, Bug, CheckCircle2, Activity, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ['#00ff88', '#00d4ff', '#b300ff', '#ffaa00', '#ff0055'];

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: actividad, isLoading: isLoadingActividad } = useGetDashboardActividad();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del estado del estudio.</p>
        </div>

        {isLoadingStats ? (
          <div className="flex justify-center py-12">
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

              <Card className="border-chart-3/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tareas Semanales</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground">{stats.tareasCompletadasSemana}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center border border-chart-3/30">
                    <CheckCircle2 className="h-6 w-6 text-chart-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Actividad Semanal</CardTitle>
                  <CardDescription>Volumen de tareas y bugs en los últimos 7 días</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.actividadSemanal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="dia" stroke="#888" />
                      <YAxis stroke="#888" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="tareas" stroke="#00ff88" strokeWidth={2} name="Tareas" dot={{ fill: '#00ff88' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="bugs" stroke="#00d4ff" strokeWidth={2} name="Bugs" dot={{ fill: '#00d4ff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 border-primary/20">
                <CardHeader>
                  <CardTitle>Bugs por Prioridad</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.bugsPorPrioridad}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="cantidad"
                        nameKey="prioridad"
                        stroke="none"
                      >
                        {stats.bugsPorPrioridad?.map((entry, index) => (
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

              <Card className="col-span-1 lg:col-span-2 xl:col-span-3 border-primary/20">
                <CardHeader>
                  <CardTitle>Progreso de Proyectos</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.progresoPorProyecto} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#888" />
                      <YAxis dataKey="nombre" type="category" stroke="#888" width={100} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="progreso" fill="#00ff88" radius={[0, 4, 4, 0]} name="Progreso (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}

        {/* Feed de Actividad */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Feed de Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActividad ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : actividad && actividad.length > 0 ? (
              <div className="space-y-6">
                {actividad.map((item, i) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {i !== actividad.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border"></div>
                    )}
                    <Avatar className="h-8 w-8 z-10 ring-2 ring-background">
                      <AvatarImage src={item.avatar || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">{item.usuario.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 pb-2">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{item.usuario}</span>{" "}
                        <span className="text-muted-foreground">{item.mensaje}</span>
                      </p>
                      <span className="text-xs text-muted-foreground/70 mt-1">
                        {format(new Date(item.fecha), "dd MMM, HH:mm", { locale: es })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay actividad reciente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}