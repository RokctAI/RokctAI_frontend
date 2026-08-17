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

"use client";

import { differenceInMinutes } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import t from "@/app/lib/i18n";
 
import { fetcher } from "@/lib/utils";

import { CheckCircle, InfoIcon } from "../custom/icons";
import { Input } from "../ui/input";

export function AuthorizePayment({
  intent = { reservationId: "sample-uuid" },
}: {
  intent?: { reservationId: string };
}) {
  const { data: reservation, mutate } = useSWR(
    `/api/reservation?id=${intent.reservationId}`,
    fetcher,
  );

  const [input, setInput] = useState("");

  const handleAuthorize = async (magicWord: string) => {
    try {
      const response = await fetch(
        `/api/reservation?id=${intent.reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ magicWord }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const updatedReservation = await response.json();
      mutate(updatedReservation);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return reservation?.hasCompletedPayment ? (
     <div className="bg-emerald-500 p-4 rounded-lg gap-4 flex flex-row justify-between items-center">
       <div className="dark:text-emerald-950 text-emerald-50 font-medium">
         {t('common.payment_verified')}
       </div>
       <div className="dark:text-emerald-950 text-emerald-50">
         <CheckCircle size={20} />
       </div>
     </div>
   ) : differenceInMinutes(new Date(), new Date(reservation?.createdAt)) >
     150 ? (
     <div className="bg-red-500 p-4 rounded-lg gap-4 flex flex-row justify-between items-center">
       <div className="text-background">{t('common.payment_timeout')}</div>
       <div className="text-background">
         <InfoIcon size={20} />
       </div>
     </div>
  ) : (
     <div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
       <div className="text font-medium">
         {t('common.use_saved_info')}
       </div>
       <div className="text-muted-foreground text-sm sm:text-base">
         {t('common.magic_word_hint')}
       </div>
 
       <Input
         type="text"
         placeholder={t('common.ph_enter_magic_word')}
         className="dark:bg-zinc-700 text-base border-none mt-2"
        onChange={(event) => setInput(event.currentTarget.value)}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            await handleAuthorize(input);
            setInput("");
          }
        }}
      />
    </div>
  );
}
