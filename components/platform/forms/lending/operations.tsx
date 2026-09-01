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
 * Generated Form Components for Platform Module: lending, Group: operations
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

import * as actions from "@/app/actions/platform/lending/operations";
import * as validators from "@/lib/platform/validators/lending/operations";

export interface RunInterestAccrualFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  defaultValues?: Partial<validators.RunInterestAccrualValues>;
}

export function RunInterestAccrualForm({
  onSuccess,
  onError,
  defaultValues,
}: RunInterestAccrualFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<validators.RunInterestAccrualValues>({
    resolver: zodResolver(validators.runInterestAccrualSchema),
    defaultValues: {
      term_loan: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (values: validators.RunInterestAccrualValues) => {
    setSubmitting(true);
    try {
      const result = await actions.runInterestAccrual(values);
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
        <CardTitle>RunInterestAccrual</CardTitle>
        <CardDescription>Run interest accrual for term loans</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="term_loan"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Term Loan</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter term_loan..." {...field} />
                  </FormControl>
                  <FormDescription>Optional loan identifier</FormDescription>
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
