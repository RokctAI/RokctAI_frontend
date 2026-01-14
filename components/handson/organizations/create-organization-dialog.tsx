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

export function CreateOrganizationDialog({ meta }: { meta: DocTypeMeta }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Organization
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new organization.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    doctype="CRM Organization"
                    meta={meta}
                    revalidatePath="/handson/all/crm/organizations"
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
