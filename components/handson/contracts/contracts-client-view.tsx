"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface ContractsClientViewProps {
    contracts: any[];
}

export function ContractsClientView({ contracts }: ContractsClientViewProps) {
    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
            <DataTable data={contracts} columns={columns} />
        </div>
    );
}
