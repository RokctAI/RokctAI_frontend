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

// @ts-nocheck
/**
 * Generated Form Components for Platform Module: control, Group: system
 * Author: ROKCT Code Generator
 */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import * as actions from "@/app/actions/platform/control/system";
import * as validators from "@/lib/platform/validators/control/system";

export interface RebootFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  defaultValues?: Partial<validators.RebootValues>;
}

export function RebootForm({
  onSuccess,
  onError,
  defaultValues,
}: RebootFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<validators.RebootValues>({
    resolver: zodResolver(validators.rebootSchema),
    defaultValues: {
      force: false,
      ...defaultValues,
    },
  });

  const onSubmit = async (values: validators.RebootValues) => {
    setSubmitting(true);
    try {
      const result = await actions.reboot(values);
      toast.success("Action executed successfully");
      if (onSuccess) onSuccess(result);
    } catch (err) {
      console.error("Action execution error:", err);
      toast.error(err.message || "Failed to execute action");
      if (onError) onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reboot</CardTitle>
        <CardDescription>
          Trigger control plane graceful system reboot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="force"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                  <FormLabel>Force</FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                "Execute Action"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
