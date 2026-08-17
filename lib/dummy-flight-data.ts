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

export const sampleFlights = {
  flights: [
    {
      id: "result_1",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T18:00:00Z",
      },
      arrival: {
        cityName: "London",
        airportCode: "LHR",
        timestamp: "2024-05-20T14:30:00Z",
      },
      airlines: ["United Airlines", "Lufthansa"],
      priceInUSD: 1200.5,
      numberOfStops: 1,
    },
    {
      id: "result_2",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T17:30:00Z",
      },
      arrival: {
        cityName: "London",
        airportCode: "LGW",
        timestamp: "2024-05-20T15:00:00Z",
      },
      airlines: ["British Airways"],
      priceInUSD: 1350,
      numberOfStops: 0,
    },
    {
      id: "result_3",
      departure: {
        cityName: "San Francisco",
        airportCode: "SFO",
        timestamp: "2024-05-19T19:15:00Z",
      },
      arrival: {
        cityName: "London",
        airportCode: "LHR",
        timestamp: "2024-05-20T16:45:00Z",
      },
      airlines: ["Delta Air Lines", "Air France"],
      priceInUSD: 1150.75,
      numberOfStops: 1,
    },
  ],
};

export const sampleSeats = {
  seats: [
    [
      { seatNumber: "1A", priceInUSD: 150, isAvailable: true },
      { seatNumber: "1B", priceInUSD: 150, isAvailable: false },
      { seatNumber: "1C", priceInUSD: 150, isAvailable: true },
      { seatNumber: "1D", priceInUSD: 150, isAvailable: true },
      { seatNumber: "1E", priceInUSD: 150, isAvailable: false },
      { seatNumber: "1F", priceInUSD: 150, isAvailable: true },
    ],
    [
      { seatNumber: "2A", priceInUSD: 120, isAvailable: true },
      { seatNumber: "2B", priceInUSD: 120, isAvailable: true },
      { seatNumber: "2C", priceInUSD: 120, isAvailable: false },
      { seatNumber: "2D", priceInUSD: 120, isAvailable: false },
      { seatNumber: "2E", priceInUSD: 120, isAvailable: true },
      { seatNumber: "2F", priceInUSD: 120, isAvailable: true },
    ],
    [
      { seatNumber: "5E", priceInUSD: 100, isAvailable: true },
      { seatNumber: "5F", priceInUSD: 100, isAvailable: true },
    ],
  ],
};

export const sampleReservation = {
  seats: ["5E"],
  flightNumber: "DL123",
  departure: {
    cityName: "San Francisco",
    airportCode: "SFO",
    timestamp: "2024-05-19T19:15:00Z",
    gate: "C3",
    terminal: "2",
  },
  arrival: {
    cityName: "London",
    airportCode: "LHR",
    timestamp: "2024-05-20T16:45:00Z",
    gate: "B32",
    terminal: "5",
  },
  passengerName: "John Doe",
  totalPriceInUSD: 1250.75,
};
