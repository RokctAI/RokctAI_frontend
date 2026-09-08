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
