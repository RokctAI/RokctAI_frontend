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
