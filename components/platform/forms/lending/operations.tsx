/*
 * Copyright (c) 2026 RokctAI
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
