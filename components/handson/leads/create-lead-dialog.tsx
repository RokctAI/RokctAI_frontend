"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GenericForm } from "@/components/handson/generic-form";
import { Plus } from "lucide-react";
import { DocTypeMeta } from "@/app/actions/handson/all/crm/meta";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// We pass meta from the server component to keep the data usage efficient
export function CreateLeadDialog({ meta }: { meta: DocTypeMeta }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Lead</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new lead.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    doctype="CRM Lead"
                    meta={meta}
                    revalidatePath="/handson/all/crm/leads"
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
