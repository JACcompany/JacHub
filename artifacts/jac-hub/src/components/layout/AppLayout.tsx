import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, useListNotificaciones, useHealthCheck } from "@workspace/api-client-react";
import { 
  LayoutDashboard, Kanban, ListTodo, Bug, 
  Users, Package, Bell, Settings, LogOut, Loader2, Menu,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: health } = useHealthCheck();
  const logoutMutation = useLogout();
  const { data: notificaciones } = useListNotificaciones();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notificaciones?.filter(n => !n.leida).length || 0;

  // Redirigir a login si no hay sesión activa
  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation("/login");
    }
  }, [isUserLoading, user, setLocation]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/proyectos", label: "Proyectos", icon: Kanban },
    { href: "/tareas", label: "Tareas", icon: ListTodo },
    { href: "/bugs", label: "Bugs", icon: Bug },
    { href: "/equipo", label: "Equipo", icon: Users },
    { href: "/builds", label: "Builds", icon: Package },
    { href: "/notificaciones", label: "Notificaciones", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl uppercase tracking-wider">
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary flex items-center justify-center shadow-[0_0_10px_rgba(0,255,136,0.3)]">
              J
            </div>
            JAC Hub
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(0,255,136,0.1)]" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"}`}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="default" className="ml-auto bg-primary text-primary-foreground">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8 border border-primary/30">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-sidebar-accent text-primary">{user.nombre.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left truncate flex-1">
                  <span className="text-sm font-medium leading-none">{user.nombre}</span>
                  <span className="text-xs text-muted-foreground mt-1 truncate w-full">{user.rol}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-popover-border">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => setLocation("/configuracion")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Configuración
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar - Mobile only mainly, but can hold breadcrumbs/actions */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary flex items-center justify-center">J</div>
            JAC
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden flex flex-col">
            <div className="p-4 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            <nav className="flex flex-col gap-4 p-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 text-lg ${location === item.href ? "text-primary" : "text-foreground"}`}>
                  <item.icon className="h-6 w-6" />
                  {item.label}
                </Link>
              ))}
              <Button variant="destructive" className="mt-8 justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" /> Cerrar sesión
              </Button>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}