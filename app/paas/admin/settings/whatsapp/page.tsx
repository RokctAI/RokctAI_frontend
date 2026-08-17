/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Author: ROKCT Code Generator
 * Premium WhatsApp settings manager with toggle between 
 * Meta Official Cloud API and Host-Level Baileys Bridge
 */

"use client";

import { Loader2, Save, ExternalLink, Smartphone, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import {
  getWhatsAppConfig,
  updateWhatsAppConfig,
  getTenantId,
} from "@/app/actions/paas/whatsapp";
import WhatsAppLinkCard from "@/components/custom/WhatsAppLinkCard";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import t from "@/app/lib/i18n";

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"cloud" | "link">("link");
  const [tenantId, setTenantId] = useState("");
  const [formData, setFormData] = useState({
    enabled: false,
    phone_number_id: "",
    access_token: "",
    app_secret: "",
    verify_token: "",
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configData, activeTenantId] = await Promise.all([
          getWhatsAppConfig(),
          getTenantId(),
        ]);
        
        setTenantId(activeTenantId);

        if (configData) {
          setFormData({
            enabled: !!configData.enabled,
            phone_number_id: configData.phone_number_id || "",
            access_token: configData.access_token || "",
            app_secret: configData.app_secret || "",
             verify_token: configData.verify_token || "",
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWhatsAppConfig(formData);
      toast.success("WhatsApp configuration saved");
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-muted/20 pb-6">
         <div>
           <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
             {t('app.paas.admin.settings.whatsapp.title')}
           </h1>
           <p className="text-sm text-muted-foreground mt-2">
             {t('app.paas.admin.settings.whatsapp.desc')}
           </p>
         </div>
         
         {mode === "cloud" && (
           <Button variant="outline" size="sm" asChild>
             <Link href="https://developers.facebook.com/apps" target="_blank" className="flex items-center">
               <ExternalLink className="mr-2 size-4" />
               {t('app.paas.admin.settings.whatsapp.meta_dashboard')}
             </Link>
           </Button>
         )}
       </div>


      {/* Integration Mode Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-muted/30 border border-muted/50 rounded-2xl max-w-lg shadow-inner">
        <button
          onClick={() => setMode("link")}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            mode === "link"
              ? "bg-background shadow-lg text-primary border border-muted/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="size-4" />
          ROKCT Web Link (Baileys)
        </button>
        <button
          onClick={() => setMode("cloud")}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            mode === "cloud"
              ? "bg-background shadow-lg text-primary border border-muted/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="size-4" />
          Meta Cloud API
        </button>
      </div>

      {/* Conditional Content Rendering */}
      {mode === "link" ? (
        <div className="space-y-6">
          <WhatsAppLinkCard tenantId={tenantId} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in-50 duration-300">
          <Card className="border border-muted/40 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
              <CardDescription className="text-xs">
                Enable or disable the WhatsApp bot globally for this tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-muted/20 p-4 bg-muted/5">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    When disabled, the bot will not reply to any messages.
                  </p>
                </div>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-muted/40 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">API Credentials</CardTitle>
              <CardDescription className="text-xs">
                Get these from your{" "}
                <a
                  href="https://developers.facebook.com"
                  className="underline text-primary hover:text-primary/95 transition-colors"
                >
                  Meta App Dashboard
                </a>{" "}
                under WhatsApp &gt; API Setup.
              </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
               <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-xs text-amber-600 dark:text-amber-400 font-medium">
                 {t('app.paas.admin.settings.whatsapp.note_meta_dashboard')}
               </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number_id" className="text-xs font-semibold">
                    {t('app.paas.admin.settings.whatsapp.label_phone_id')}
                  </Label>
                  <Input
                    id="phone_number_id"
                    name="phone_number_id"
                    value={formData.phone_number_id}
                    onChange={handleChange}
                    placeholder={t('app.paas.admin.settings.whatsapp.ph_phone_id')}
                    className="h-10 text-sm"
                    required
                  />
                 <p className="text-[10px] text-muted-foreground">
                   {t('app.paas.admin.settings.whatsapp.hint_phone_id')}
                 </p>
               </div>


                <div className="space-y-2">
                         <Label htmlFor="access_token" className="text-xs font-semibold">
                           {t('app.paas.admin.settings.whatsapp.label_access_token')}
                         </Label>
                  <Input
                    id="access_token"
                    name="access_token"
                    type="password"
                    value={formData.access_token}
                    onChange={handleChange}
                    placeholder={t('app.paas.admin.settings.whatsapp.ph_access_token')}
                    className="h-10 text-sm"
                    required
                  />
                 <p className="text-[10px] text-muted-foreground">
                   {t('app.paas.admin.settings.whatsapp.hint_access_token')}
                 </p>
               </div>

                <div className="space-y-2">
                         <Label htmlFor="app_secret" className="text-xs font-semibold">
                           {t('app.paas.admin.settings.whatsapp.label_app_secret')}
                         </Label>
                  <Input
                    id="app_secret"
                    name="app_secret"
                    type="password"
                    value={formData.app_secret}
                    onChange={handleChange}
                    className="h-10 text-sm"
                  />
                 <p className="text-[10px] text-muted-foreground">
                   {t('app.paas.admin.settings.whatsapp.hint_app_secret')}
                 </p>
               </div>
             </CardContent>
           </Card>

           <Card className="border border-muted/40 bg-background/50 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="text-lg">{t('app.paas.admin.settings.whatsapp.webhook_title')}</CardTitle>
               <CardDescription className="text-xs">
                 {t('app.paas.admin.settings.whatsapp.webhook_desc')}
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-xs font-semibold">{t('app.paas.admin.settings.whatsapp.label_callback_url')}</Label>
                   <div className="flex items-center space-x-2">
                     <Input
                       disabled
                       value={`https://${typeof window !== "undefined" ? window.location.hostname : "your-site.com"}/api/method/paas.whatsapp.api.webhook.webhook`}
                       className="bg-muted/50 border-muted/30 text-xs h-10 select-all"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="verify_token" className="text-xs font-semibold">
                      {t('app.paas.admin.settings.whatsapp.label_verify_token')}
                    </Label>
                   <Input
                     id="verify_token"
                     name="verify_token"
                     value={formData.verify_token}
                     onChange={handleChange}
                     className="h-10 text-sm"
                      placeholder={t('app.paas.admin.settings.whatsapp.ph_verify_token')}
                   />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="lg" className="px-6 font-semibold shadow-lg shadow-primary/10">
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
