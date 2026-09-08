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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { GenericForm } from "@/components/handson/generic-form";
import { createContract } from "@/app/actions/handson/all/crm/contracts";
import { DocTypeMeta } from "@/app/actions/handson/all/crm/meta";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateContractDialog({ meta }: { meta: DocTypeMeta }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(data: any) {
    const result = await createContract(data);
    if (result.success) {
      toast.success("Contract created successfully");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create contract");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>
            Create a new contract for a customer or supplier.
          </DialogDescription>
        </DialogHeader>
        <GenericForm
          meta={meta}
          onSubmit={handleSubmit}
          submitLabel="Create Contract"
        />
      </DialogContent>
    </Dialog>
  );
}
