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

"use client";

import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  getLandingPage,
  updateLandingPage,
} from "@/app/actions/paas/admin/settings";
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
import { Textarea } from "@/components/ui/textarea";
import t from "@/app/lib/i18n";

export default function LandingPageSettings() {
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    main_section: "",
    published: 0,
  });

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      const data = await getLandingPage();
      if (data) {
        setPageData(data);
        setFormData({
          title: data.title || "",
          main_section: data.main_section || "",
          published: data.published || 0,
        });
      }
    } catch (error) {
      toast.error("Failed to load landing page settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await updateLandingPage(formData);
      toast.success("Landing page updated");
    } catch (error) {
      toast.error("Failed to update landing page");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Landing Page Settings
        </h2>
        <p className="text-muted-foreground">
          Manage the content and visibility of your landing page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Configure the main title and content of the landing page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Page Title</Label>
             <Input
               value={formData.title}
               onChange={(e) =>
                 setFormData({ ...formData, title: e.target.value })
               }
               placeholder={t('app.paas.admin.settings.landing.ph_title')}
             />
          </div>
          <div className="space-y-2">
            <Label>Main Content (JSON/HTML)</Label>
               <Textarea
                 value={formData.main_section}
                 onChange={(e) =>
                   setFormData({ ...formData, main_section: e.target.value })
                 }
                 placeholder={t('app.paas.admin.settings.landing.ph_content')}
                 className="min-h-[200px] font-mono"
               />
            <p className="text-xs text-muted-foreground">
              This field supports JSON configuration for dynamic sections or raw
              HTML.
            </p>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              checked={!!formData.published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, published: checked ? 1 : 0 })
              }
            />
            <Label>Published</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 size-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
