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

import { Button } from "@/components/ui/button";
import { LayoutGrid, TableProperties } from "lucide-react";

export function ViewToggle({
  view,
  onViewChange,
}: {
  view: "list" | "kanban";
  onViewChange: (v: "list" | "kanban") => void;
}) {
  return (
    <div className="flex items-center border rounded-md p-1 bg-muted/20">
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2"
        onClick={() => onViewChange("list")}
      >
        <TableProperties className="h-4 w-4 mr-1.5" /> List
      </Button>
      <Button
        variant={view === "kanban" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2"
        onClick={() => onViewChange("kanban")}
      >
        <LayoutGrid className="h-4 w-4 mr-1.5" /> Kanban
      </Button>
    </div>
  );
}
