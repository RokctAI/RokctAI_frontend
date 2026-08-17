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

import { format } from "date-fns";

const SAMPLE = {
  seats: ["4C"],
  flightNumber: "EK413",
  departure: {
    cityName: "Sydney",
    airportCode: "SYD",
    timestamp: "2023-11-01T06:00:00",
    gate: "A12",
    terminal: "1",
  },
  arrival: {
    cityName: "Chennai",
    airportCode: "MAA",
    timestamp: "2023-11-01T18:45:00",
    gate: "B5",
    terminal: "3",
  },
  passengerName: "John Doe",
  totalPriceInUSD: 1200,
};

export function CreateReservation({ reservation = SAMPLE }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <div>
        <div className="flex flex-col justify-between gap-4">
          <div className="text font-medium">
            <span className="no-skeleton text-foreground/50">
              Continue purchasing this reservation from{" "}
            </span>
            {reservation.departure.cityName} to {reservation.arrival.cityName}
            <span className="no-skeleton text-foreground/50"> at </span>{" "}
            <span className="no-skeleton text-emerald-600 font-medium">
              ${reservation.totalPriceInUSD} USD
              <span className="no-skeleton text-foreground/50 ">?</span>
            </span>
          </div>

          <div className="flex flex-row gap-6">
            <div className="flex flex-col gap-1">
              <div className="text font-medium sm:text-base text-sm">Seats</div>
              <div className="text-muted-foreground sm:text-base text-sm">
                {reservation.seats.join(", ")}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text sm:text-base text-sm font-medium">
                Flight Number
              </div>
              <div className="text sm:text-base text-sm text-muted-foreground">
                {reservation.flightNumber}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text font-medium sm:text-base text-sm">Date</div>
              <div className="text text-muted-foreground sm:text-base text-sm">
                {format(new Date(reservation.arrival.timestamp), "dd LLL yyyy")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
