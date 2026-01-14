"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, TableProperties } from "lucide-react";

export function ViewToggle({ view, onViewChange }: { view: "list" | "kanban", onViewChange: (v: "list" | "kanban") => void }) {
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
