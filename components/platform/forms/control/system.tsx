/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
