"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Calendar,
    Slack,
    Video,
    CheckCircle2,
    XCircle,
    Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    disconnectIntegration
} from "@/app/actions/handson/tenant/settings/integrations";

// Map icon strings to components
const iconMap: Record<string, any> = {
    Calendar: Calendar,
    Slack: Slack,
    Video: Video
};

export default function IntegrationsPage() {
    const [services, setServices] = useState<IntegrationService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<IntegrationService | null>(null);
    const [apiKey, setApiKey] = useState("");

    useEffect(() => {
        loadIntegrations();
    }, []);

    async function loadIntegrations() {
        setLoading(true);
        try {
            const data = await getIntegrations();
            setServices(data);
        } catch (e) {
            toast.error("Failed to load integrations");
        } finally {
            setLoading(false);
        }
    }

    async function handleConnect() {
        if (!selectedService) return;
        try {
            await connectIntegration(selectedService.name, { apiKey });
            toast.success(`Connected to ${selectedService.label}`);
            setSelectedService(null);
            setApiKey("");
            // Optimistic update or reload
            setServices(prev => prev.map(s => s.name === selectedService.name ? { ...s, is_connected: true } : s));
        } catch (e) {
            toast.error("Connection failed");
        }
    }

    async function handleDisconnect(service: IntegrationService) {
        if (!confirm(`Disconnect ${service.label}?`)) return;
        try {
            await disconnectIntegration(service.name);
            toast.success(`Disconnected ${service.label}`);
            setServices(prev => prev.map(s => s.name === service.name ? { ...s, is_connected: false } : s));
        } catch (e) {
            toast.error("Disconnection failed");
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">Connect your workspace with your favorite tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                    const Icon = iconMap[service.icon] || Settings2;
                    return (
                        <Card key={service.name} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{service.label}</CardTitle>
                                <Icon className="h-6 w-6 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="flex-1 pt-4">
                                <CardDescription className="text-sm text-muted-foreground mb-4">
                                    {service.description}
                                </CardDescription>
                                <div className="flex items-center gap-2">
                                    {service.is_connected ? (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                            <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            <XCircle className="mr-1 h-3 w-3" /> Disconnected
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t">
                                {service.is_connected ? (
                                    <div className="flex gap-2 w-full">
                                        <Button variant="outline" className="flex-1">Configure</Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDisconnect(service)}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="w-full" onClick={() => setSelectedService(service)}>
                                        Connect
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect {selectedService?.label}</DialogTitle>
                        <DialogDescription>
                            Enter your API Key or Client Secret to enable this integration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>API Key / Token</Label>
                            <Input
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk_live_..."
                                type="password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedService(null)}>Cancel</Button>
                        <Button onClick={handleConnect}>Save & Connect</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
