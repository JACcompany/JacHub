import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Monitor, User, Shield, Terminal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Configuracion() {
  const { data: user, isLoading } = useGetMe();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Simular guardado
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Parámetros actualizados", description: "La configuración se ha guardado en el núcleo." });
    }, 800);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Parámetros del Sistema</h1>
          <p className="text-muted-foreground">Configuración personal y preferencias de la interfaz.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            <Card className="border-primary/20">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Perfil Operativo
                </CardTitle>
                <CardDescription>Modifica tu identidad dentro de JAC Hub.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border-2 border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback className="text-3xl bg-muted text-primary">{user?.nombre.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="text-xs">Cambiar Avatar</Button>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre de Operador</Label>
                        <Input defaultValue={user?.nombre} className="bg-background/50 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label>Correo de Contacto</Label>
                        <Input defaultValue={user?.email} disabled className="bg-muted opacity-50 cursor-not-allowed" />
                      </div>
                      <div className="space-y-2">
                        <Label>Rol Asignado</Label>
                        <Input defaultValue={user?.rol} disabled className="bg-muted opacity-50 font-mono text-xs cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Interfaz y Terminal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Efectos Neón (Glitch/Glow)</Label>
                    <p className="text-sm text-muted-foreground">Habilitar efectos visuales intensos en la UI.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones Sonoras</Label>
                    <p className="text-sm text-muted-foreground">Reproducir sonido técnico al recibir alertas.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Alto Contraste Terminal</Label>
                    <p className="text-sm text-muted-foreground">Optimizar textos pequeños y consola.</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="border-b border-destructive/20 pb-4">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Autenticación Biométrica / 2FA</Label>
                    <p className="text-sm text-muted-foreground">Actualmente deshabilitado para tu terminal.</p>
                  </div>
                  <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">Configurar</Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline">Restaurar</Button>
              <Button onClick={handleSave} disabled={saving} className="min-w-[140px] shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
                Guardar Config
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}