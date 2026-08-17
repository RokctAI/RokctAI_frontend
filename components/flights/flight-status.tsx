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

import { differenceInHours, format } from "date-fns";

import { ArrowUpRightSmallIcon } from "../custom/icons";

const SAMPLE = {
  flightNumber: "BA142",
  departure: {
    cityName: "London",
    airportCode: "LHR",
    airportName: "London Heathrow Airport",
    timestamp: "2024-10-08T18:30:00Z",
    terminal: "5",
    gate: "A10",
  },
  arrival: {
    cityName: "New York",
    airportCode: "JFK",
    airportName: "John F. Kennedy International Airport",
    timestamp: "2024-10-09T07:30:00Z",
    terminal: "7",
    gate: "B22",
  },
  totalDistanceInMiles: 3450,
};

export function Row({ row = SAMPLE.arrival, type = "arrival" }) {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center">
            <div className="bg-foreground text-background rounded-full size-fit">
              {type === "arrival" ? (
                <div className="rotate-90">
                  <ArrowUpRightSmallIcon size={16} />
                </div>
              ) : (
                <ArrowUpRightSmallIcon size={16} />
              )}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              {row.airportCode}
            </div>
            <div>·</div>
            <div className="text-sm sm:text-base truncate max-w-32 sm:max-w-64 text-muted-foreground">
              {row.airportName}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-medium">
            {format(new Date(row.timestamp), "h:mm a")}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 items-end justify-center mt-auto">
        <div className="text-sm sm:text-sm bg-amber-400 rounded-md w-fit px-2 text-amber-900">
          {row.gate}
        </div>
        <div className="text-sm text-muted-foreground">
          Terminal {row.terminal}
        </div>
      </div>
    </div>
  );
}

export function FlightStatus({ flightStatus = SAMPLE }) {
  return (
    <div className="flex flex-col gap-2 bg-muted rounded-lg p-4">
      <div className="flex flex-col gap-1 text-sm">
        <div className="text-muted-foreground">{flightStatus.flightNumber}</div>
        <div className="text-lg font-medium">
          {flightStatus.departure.cityName} to {flightStatus.arrival.cityName}
        </div>
      </div>

      <div className="h-px grow bg-muted-foreground/20" />

      <Row row={flightStatus.arrival} type="departure" />

      <div className="flex flex-row gap-2 items-center">
        <div className="text-xs text-muted-foreground ">
          {differenceInHours(
            new Date(flightStatus.arrival.timestamp),
            new Date(flightStatus.departure.timestamp),
          )}{" "}
          hours
        </div>
        <div>·</div>
        <div className="text-xs text-muted-foreground">
          {flightStatus.totalDistanceInMiles} mi
        </div>
        <div className="h-px grow bg-muted-foreground/20 ml-2" />
      </div>

      <Row row={flightStatus.departure} type="arrival" />
    </div>
  );
}
