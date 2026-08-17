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

import { Loader2, Plus, Trash2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getDeliveryZones,
  createDeliveryZone,
  deleteDeliveryZone,
} from "@/app/actions/paas/delivery-zones";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import t from "@/app/lib/i18n";

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newZoneCoords, setNewZoneCoords] = useState("");

  useEffect(() => {
    fetchZones();
  }, []);

  async function fetchZones() {
    try {
      const data = await getDeliveryZones();
      setZones(data);
    } catch (error) {
      console.error("Error fetching zones:", error);
      toast.error("Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Parse coordinates
      let coords;
      try {
        coords = JSON.parse(newZoneCoords);
        if (!Array.isArray(coords) || coords.length < 3) {
          throw new Error(
            "Invalid coordinates format. Must be an array of at least 3 points.",
          );
        }
      } catch (err) {
        toast.error(
          "Invalid JSON format for coordinates. Example: [[lat1, lng1], [lat2, lng2], [lat3, lng3]]",
        );
        setCreating(false);
        return;
      }

      // Convert to backend format if needed, or assume backend handles [[lat, lng]]
      // The map.js legacy code sent: address: [{0: lat, 1: lng}, ...]
      // Let's try to match that if the backend expects it, or standard GeoJSON
      // Based on map.js:
      // const body = {
      //   address: triangleCoords?.map((item) => ({
      //     0: item?.lat,
      //     1: item?.lng,
      //   })),
      // };

      // If user inputs [[lat, lng], ...], we convert
      const formattedAddress = coords.map((point: any) => {
        if (Array.isArray(point)) return { 0: point[0], 1: point[1] };
        return point; // Assume already in correct format if object
      });

      await createDeliveryZone({ address: formattedAddress });
      toast.success("Delivery zone created successfully");
      setNewZoneCoords("");
      fetchZones();
    } catch (error) {
      console.error("Error creating zone:", error);
      toast.error("Failed to create delivery zone");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    try {
      await deleteDeliveryZone(name);
      toast.success("Delivery zone deleted successfully");
      fetchZones();
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast.error("Failed to delete delivery zone");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/paas/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
         <h1 className="text-3xl font-bold">{t('app.paas.dashboard.settings.delivery_zones.title')}</h1>
      </div>

       <Alert>
         <AlertCircle className="size-4" />
         <AlertTitle>{t('app.paas.dashboard.settings.delivery_zones.alert_title')}</AlertTitle>
         <AlertDescription>
           {t('app.paas.dashboard.settings.delivery_zones.alert_desc')}
         </AlertDescription>
       </Alert>

      <Card>
         <CardHeader>
           <CardTitle>{t('app.paas.dashboard.settings.delivery_zones.card_title')}</CardTitle>
           <CardDescription>
             {t('app.paas.dashboard.settings.delivery_zones.card_desc')}
           </CardDescription>
         </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="coords">{t('app.paas.dashboard.settings.delivery_zones.label_coords')}</Label>
                 <Textarea
                   id="coords"
                   value={newZoneCoords}
                   onChange={(e) => setNewZoneCoords(e.target.value)}
                   placeholder={t('app.paas.dashboard.settings.delivery_zones.ph_coords')}
                   rows={4}
                   required
                 />
               </div>
             <Button type="submit" disabled={creating}>
               {creating ? (
                 <>
                   <Loader2 className="mr-2 size-4 animate-spin" />
                   {t('common.creating')}
                 </>
               ) : (
                 <>
                   <Plus className="mr-2 size-4" />
                   {t('app.paas.dashboard.settings.delivery_zones.btn_add')}
                 </>
               )}
             </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
         {zones.length === 0 ? (
           <div className="text-center text-muted-foreground py-8">
             {t('app.paas.dashboard.settings.delivery_zones.no_data')}
           </div>
         ) : (
          zones.map((zone) => (
            <Card key={zone.name}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <div className="font-medium">{zone.name}</div>
                  {/* Display more info if available */}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => handleDelete(zone.name)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
