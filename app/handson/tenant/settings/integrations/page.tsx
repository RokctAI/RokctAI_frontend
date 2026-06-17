/**
 * Author: ROKCT Code Generator
 * Integrations settings page supporting general integrations (Slack, Calendar)
 * and the first-class ROKCT WhatsApp Web Link native integration card
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Slack,
  Video,
  CheckCircle2,
  XCircle,
  Settings2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  IntegrationService,
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
} from "@/app/actions/handson/tenant/settings/integrations";
import WhatsAppLinkCard from "@/components/custom/WhatsAppLinkCard";
import t from "@/app/lib/i18n";

// Map icon strings to components
const iconMap: Record<string, any> = {
  Calendar: Calendar,
  Slack: Slack,
  Video: Video,
};

export default function IntegrationsPage() {
  const [services, setServices] = useState<IntegrationService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] =
    useState<IntegrationService | null>(null);
  const [apiKey, setApiKey] = useState("");

  // WhatsApp connection states
  const { data: session } = useSession();
  const [wsConnected, setWsConnected] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const siteName = (session?.user as any)?.siteName || "local_tenant";
  const tenantId = siteName.replace(/[^a-zA-Z0-9]/g, "_");

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    if (tenantId) {
      checkWhatsAppStatus();
    }
  }, [tenantId, showWhatsAppModal]); // Re-verify status when modal opens or closes

  async function checkWhatsAppStatus() {
    try {
      const response = await fetch(`/api/whatsapp/status?tenantId=${tenantId}`);
      if (response.ok) {
        const res = await response.json();
        setWsConnected(!!res.connected);
      }
    } catch (err) {
      console.error("WhatsApp status check failed:", err);
    }
  }

  async function loadIntegrations() {
    setLoading(true);
    try {
      const data = await getIntegrations();
      setServices(data);
    } catch (e) {
      toast.error(t('app.integrations.toast_load_fail'));
    } finally {
      setLoading(false);
    }
  }
  }

  async function handleConnect() {
    if (!selectedService) return;
    try {
      await connectIntegration(selectedService.name, { apiKey });
      toast.success(t('app.integrations.toast_connect_success', { service: selectedService.label }));
      setSelectedService(null);
      setApiKey("");
      // Optimistic update or reload
      setServices((prev) =>
        prev.map((s) =>
          s.name === selectedService.name ? { ...s, is_connected: true } : s,
        ),
      );
    } catch (e) {
      toast.error(t('app.integrations.toast_connect_fail'));
    }
  }

  async function handleDisconnect(service: IntegrationService) {
    if (!confirm(t('app.integrations.confirm_disconnect', { service: service.label }))) return;
    try {
      await disconnectIntegration(service.name);
      toast.success(t('app.integrations.toast_disconnect_success', { service: service.label }));
      setServices((prev) =>
        prev.map((s) =>
          s.name === service.name ? { ...s, is_connected: false } : s,
        ),
      );
    } catch (e) {
      toast.error(t('app.integrations.toast_disconnect_fail'));
    }
  }

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('app.integrations.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('app.integrations.desc')}
          </p>
        </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dynamic Integrations list */}
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Settings2;
            return (
              <Card key={service.name} className="flex flex-col border border-muted/40 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    {service.label}
                  </CardTitle>
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <CardDescription className="text-sm text-muted-foreground mb-4">
                    {service.description}
                  </CardDescription>
                  <div className="flex items-center gap-2">
                     {service.is_connected ? (
                       <Badge
                         variant="default"
                         className="bg-green-600 hover:bg-green-700"
                       >
                         <CheckCircle2 className="mr-1 h-3 w-3" /> {t('app.integrations.status_connected')}
                       </Badge>
                     ) : (
                       <Badge variant="outline" className="text-muted-foreground">
                         <XCircle className="mr-1 h-3 w-3" /> {t('app.integrations.status_disconnected')}
                       </Badge>
                     )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-muted/20">
                  {service.is_connected ? (
                     <div className="flex gap-2 w-full">
                       <Button variant="outline" className="flex-1">
                         {t('app.integrations.btn_configure')}
                       </Button>
                       <Button
                         variant="destructive"
                         size="icon"
                         onClick={() => handleDisconnect(service)}
                       >
                         <XCircle className="h-4 w-4" />
                       </Button>
                     </div>
                  ) : (
                     <Button
                       className="w-full"
                       onClick={() => setSelectedService(service)}
                     >
                       {t('app.integrations.btn_connect')}
                     </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}

          {/* Premium WhatsApp Native Integration Card */}
          <Card className="flex flex-col border border-primary/20 bg-gradient-to-br from-background/80 via-background/40 to-background/20 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                 {t('app.integrations.whatsapp_title')}
               </CardTitle>
               <Smartphone className="h-6 w-6 text-primary animate-pulse" />
             </CardHeader>
             <CardContent className="flex-1 pt-4">
               <CardDescription className="text-sm text-muted-foreground mb-4">
                 {t('app.integrations.whatsapp_desc')}
               </CardDescription>
               <div className="flex items-center gap-2">
                 {wsConnected ? (
                   <Badge
                     variant="default"
                     className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                   >
                     <CheckCircle2 className="mr-1 h-3 w-3" /> {t('app.integrations.status_connected')}
                   </Badge>
                 ) : (
                   <Badge variant="outline" className="text-muted-foreground font-medium">
                     <XCircle className="mr-1 h-3 w-3" /> {t('app.integrations.status_disconnected')}
                   </Badge>
                 )}
               </div>
             </CardContent>
             <CardFooter className="pt-4 border-t border-muted/20">
               <Button
                 className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-sm"
                 onClick={() => setShowWhatsAppModal(true)}
               >
                 {wsConnected ? t('app.integrations.whatsapp_btn_config') : t('app.integrations.whatsapp_btn_link')}
               </Button>
             </CardFooter>
          </Card>
        </div>
      )}

      {/* Slack/Calendar Connection Dialog */}
       <Dialog
         open={!!selectedService}
         onOpenChange={(open) => !open && setSelectedService(null)}
       >
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{t('app.integrations.dialog_title', { service: selectedService?.label })}</DialogTitle>
             <DialogDescription>
               {t('app.integrations.dialog_desc')}
             </DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="space-y-2">
               <Label>{t('app.integrations.label_api_key')}</Label>
               <Input
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
                 placeholder={t('app.integrations.ph_api_key')}
                 type="password"
               />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setSelectedService(null)}>
               {t('common.cancel')}
             </Button>
             <Button onClick={handleConnect}>{t('app.integrations.btn_save_connect')}</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

      {/* Premium WhatsApp Native Pairing Dialog */}
      <Dialog
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
      >
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-md border border-muted/40 p-0 overflow-hidden rounded-2xl">
          <WhatsAppLinkCard tenantId={tenantId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loader icon helper
function Loader2({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
