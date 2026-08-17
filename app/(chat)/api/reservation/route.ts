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

import { auth } from "@/app/(auth)/auth";
import { getReservationById, updateReservation } from "@/db/queries";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const reservation = await getReservationById({ id });

    if (reservation.userId !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    return Response.json(reservation);
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const reservation = await getReservationById({ id });

    if (!reservation) {
      return new Response("Reservation not found!", { status: 404 });
    }

    if (reservation.userId !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    if (reservation.hasCompletedPayment) {
      return new Response("Reservation is already paid!", { status: 409 });
    }

    const { magicWord } = await request.json();

    if (magicWord.toLowerCase() !== "vercel") {
      return new Response("Invalid magic word!", { status: 400 });
    }

    const updatedReservation = await updateReservation({
      id,
      hasCompletedPayment: true,
    });
    return Response.json(updatedReservation);
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
