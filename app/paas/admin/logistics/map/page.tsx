/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DeliveriesMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Deliveries Map</h2>
        <p className="text-muted-foreground">
          Real-time view of active deliveries and driver locations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Map</CardTitle>
          <CardDescription>Map integration coming soon.</CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground">
            Map integration requires Google Maps API key configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
