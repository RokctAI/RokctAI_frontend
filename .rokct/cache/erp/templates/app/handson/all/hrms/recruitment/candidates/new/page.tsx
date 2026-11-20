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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { RiArrowLeftLine, RiLoader4Line, RiSaveLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createJobApplicant,
  getJobOpenings,
} from "@/app/actions/handson/all/hrms/recruitment";

import t from "@/app/lib/i18n";
const formSchema = z.object({
  applicant_name: z.string().min(1, "Name is required"),
  email_id: z.string().email("Invalid email address"),
  job_title: z.string().min(1, "Job selection is required"),
  status: z
    .enum(["Open", "Replied", "Rejected", "Hold", "Accepted"])
    .default("Open"),
  cover_letter: z.string().optional(),
});

export default function NewCandidatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    getJobOpenings().then(setJobs);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Open",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await createJobApplicant(values);
      if (result.success) {
        toast.success("Candidate added successfully");
        router.push("/handson/all/hr/recruitment");
      } else {
        toast.error(result.error || "Failed to add candidate");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <RiArrowLeftLine className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("erp.add_new_candidate")}</h1>
          <p className="text-muted-foreground">
            {t("erp.manually_add_a_candidate_application")}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-white p-6 rounded-lg border shadow-sm"
        >
          <FormField
            control={form.control}
            name="applicant_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("erp.candidate_name")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Alice Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("erp.email_address")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. alice@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("erp.applying_for")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("erp.select_job_opening")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.name} value={job.name}>
                          {job.job_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("erp.status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("erp.select_status")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Open">{t("erp.open")}</SelectItem>
                      <SelectItem value="Replied">{t("erp.replied")}</SelectItem>
                      <SelectItem value="Hold">{t("erp.hold")}</SelectItem>
                      <SelectItem value="Accepted">{t("erp.accepted")}</SelectItem>
                      <SelectItem value="Rejected">{t("erp.rejected")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cover_letter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("erp.cover_letter_notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("erp.paste_cover_letter_or_internal_notes_here")}
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("erp.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RiSaveLine className="mr-2 h-4 w-4" />
              )}
              Save Candidate
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
