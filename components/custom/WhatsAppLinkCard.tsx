/**
 * Author: ROKCT Code Generator
 * Premium Glassmorphism WhatsApp Link Card
 * Renders real-time pairing status and QR stream via SSE
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  LogOut, 
  Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Client-side API routes are called directly, no manual server action imports needed

interface WhatsAppLinkCardProps {
  tenantId: string;
}

type ConnectionState = "idle" | "connecting" | "qr" | "open" | "close" | "error";

export default function WhatsAppLinkCard({ tenantId }: WhatsAppLinkCardProps) {
  const [connState, setConnState] = useState<ConnectionState>("idle");
  const [qrText, setQrText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check initial connection status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch(`/api/whatsapp/status?tenantId=${tenantId}`);
        if (response.ok) {
          const res = await response.json();
          if (res.connected) {
            setConnState("open");
          } else if (res.initialized) {
            setConnState("close");
          } else {
            setConnState("idle");
          }
        }
      } catch (err) {
        console.error("Status check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [tenantId]);

  const startPairing = () => {
    setConnState("connecting");
    setQrText("");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/whatsapp/connect?tenantId=${tenantId}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WhatsApp Bridge Stream:", data);

        if (data.state === "qr" && data.qr) {
          setConnState("qr");
          setQrText(data.qr);
        } else if (data.state === "open") {
          setConnState("open");
          setQrText("");
          toast.success("WhatsApp successfully connected!");
          es.close();
        } else if (data.state === "close") {
          setConnState("close");
          setQrText("");
        } else if (data.state === "error") {
          setConnState("error");
          toast.error(data.message || "Failed to pair with bridge");
          es.close();
        }
      } catch (err) {
        console.error("SSE message parse error:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      setConnState("error");
      es.close();
    };
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      if (!response.ok) throw new Error("Disconnect failed");
      setConnState("idle");
      setQrText("");
      toast.success("Successfully unlinked WhatsApp channel");
    } catch (err: any) {
      toast.error("Failed to disconnect session");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-muted/50 bg-background/50 backdrop-blur-md">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // QR rendering using api.qrserver.com
  const qrImageUrl = qrText
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrText)}`
    : null;

  return (
    <Card className="border border-muted/40 bg-gradient-to-br from-background/70 via-background/40 to-background/20 backdrop-blur-lg overflow-hidden shadow-2xl relative">
      {/* Dynamic Glow Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="border-b border-muted/20 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Smartphone className="size-5 text-primary" />
              ROKCT WhatsApp Web Link
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Scan our host-level secure QR code to enable direct customer messaging.
            </CardDescription>
          </div>

          {/* Connected Badges */}
          <AnimatePresence mode="wait">
            {connState === "open" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              >
                <Wifi className="size-3.5 animate-pulse" />
                Linked
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"
              >
                <WifiOff className="size-3.5" />
                Unlinked
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Instructions Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">
                How to link
              </h3>
              <ol className="space-y-3 text-sm text-foreground/80 list-decimal pl-4">
                <li>Open WhatsApp on your mobile phone.</li>
                <li>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong>.</li>
                <li>Tap on <strong>Link a Device</strong>.</li>
                <li>Point your phone screen to the QR Code on the right to scan it.</li>
              </ol>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {connState === "open" ? (
                <Button 
                  variant="destructive" 
                  onClick={handleDisconnect} 
                  disabled={actionLoading}
                  className="w-full sm:w-auto shadow-lg shadow-destructive/10"
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 size-4" />
                  )}
                  Unlink Channel
                </Button>
              ) : (
                <Button 
                  onClick={startPairing}
                  disabled={connState === "connecting"}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 shadow-lg shadow-primary/20 text-white font-medium"
                >
                  {connState === "connecting" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 size-4" />
                      Generate Link QR Code
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* QR Code / Status Column */}
          <div className="flex flex-col items-center justify-center p-6 border border-muted/20 bg-muted/5 rounded-2xl relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {/* State: Open (Connected) */}
              {connState === "open" && (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="size-12 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-lg text-foreground">WhatsApp Linked Successfully</p>
                    <p className="text-xs text-muted-foreground">
                      Your business instance is active and receiving commands.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* State: QR Ready */}
              {connState === "qr" && qrImageUrl && (
                <motion.div
                  key="qr-code"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-4 relative"
                >
                  <div className="p-4 bg-white rounded-2xl border border-muted shadow-inner relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={qrImageUrl} 
                      alt="WhatsApp Web Link QR Code" 
                      className="size-[200px] select-none pointer-events-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground animate-pulse">
                    Scanning takes about 5 seconds to pair.
                  </p>
                </motion.div>
              )}

              {/* State: Connecting */}
              {connState === "connecting" && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Loader2 className="size-10 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-foreground">Initializing Baileys session...</p>
                    <p className="text-xs text-muted-foreground">
                      Retrieving QR socket channel from Control VPS...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* State: Idle / Empty */}
              {connState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-3 text-muted-foreground p-6"
                >
                  <QrCode className="size-12 mx-auto stroke-[1.2] text-muted-foreground/60" />
                  <p className="text-xs">No active pairing session. Click generate to start.</p>
                </motion.div>
              )}

              {/* State: Error */}
              {connState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    <AlertCircle className="size-10 animate-shake" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-destructive">Connection Interrupted</p>
                    <p className="text-xs text-muted-foreground">
                      The pairing request timed out or was declined.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={startPairing} className="mt-2 text-xs">
                    <RefreshCw className="size-3 mr-1.5" />
                    Retry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
