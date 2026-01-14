"use strict";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <Link href={`/handson/all/crm/contracts/${row.original.name}`} className="font-medium hover:underline text-primary">
                    {row.getValue("name")}
                </Link>
            )
        },
    },
    {
        accessorKey: "party_name",
        header: "Party Name",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return <Badge variant="outline">{status}</Badge>;
        },
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
    },
    {
        accessorKey: "end_date",
        header: "End Date",
    },
];
