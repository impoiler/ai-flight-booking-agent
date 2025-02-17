"use client";

import { BookingComFlightDetails } from "@/lib/booking.com/interfaces/booking.com-flight-details";
import cx from "classnames";
import { format } from "date-fns";

export function BookingDotComFlightDetails({
  result,
}: {
  result: BookingComFlightDetails;
}) {
  const { segments, priceBreakdown, brandedFareInfo } = result;
  if (!segments || !priceBreakdown) {
    return (
      <div className="w-full p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
        Error: Flight details are missing or incomplete.
      </div>
    );
  }
  const firstSegment = segments[0];
  const firstLeg = firstSegment.legs[0];
  const { total, baseFare, tax, fee } = priceBreakdown;

  const formatPrice = (price: {
    units: number;
    nanos: number;
    currencyCode: string;
  }) => {
    return `${price.units + price.nanos / 1e9} ${price.currencyCode}`;
  };

  return (
    <div>
      <div
        className={cx(
          "flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-white text-black shadow-md max-w-full"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={firstLeg.carriersData[0].logo}
              alt={firstLeg.carriersData[0].name}
              className="size-10 object-contain"
            />
            <div>
              <span className="font-bold text-lg">
                {firstLeg.carriersData[0].name}
              </span>
              <p className="text-sm text-gray-600">
                Flight {firstLeg.flightInfo.flightNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPrice(total)}</div>
            <p className="text-sm text-gray-600">Total Price</p>
          </div>
        </div>
        {segments.map((segment, index) => (
          <div key={index} className="border-t border-gray-200 pt-4">
            {segment.legs.map((leg, legIndex) => (
              <div key={legIndex} className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {format(new Date(leg.departureTime), "HH:mm")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {leg.departureAirport.cityName} (
                      {leg.departureAirport.code})
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600">
                      {(leg.totalTime / 60 / 60).toFixed(2)} hours
                    </div>
                    <div className="relative w-full h-[2px] bg-gray-300 my-2">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        ✈️
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {leg.flightStops.length === 0
                        ? "Non-stop"
                        : `${leg.flightStops.length} stop(s)`}
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-lg">
                      {format(new Date(leg.arrivalTime), "HH:mm")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {leg.arrivalAirport.cityName} ({leg.arrivalAirport.code})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-lg mb-4">Price Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-medium">{formatPrice(baseFare)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-medium">
                {formatPrice({
                  ...tax,
                  units: tax.units + fee.units,
                  nanos: tax.nanos + fee.nanos,
                  currencyCode: tax.currencyCode,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-lg mb-4">Flight Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Flight Type</span>
              <span className="font-medium">
                {firstSegment.legs.length > 1
                  ? `${firstSegment.legs.length - 1} Stop(s)`
                  : "Non-stop"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cabin Class</span>
              <span className="font-medium">{brandedFareInfo.cabinClass}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-lg mb-4">Baggage Information</h3>
          <div className="grid auto-cols-fr grid-flow-col gap-6">
            {[
              {
                type: "Personal Item",
                isIncluded: firstSegment.travellerCabinLuggage[0]?.personalItem,
                icon: (
                  <svg
                    className="size-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                ),
                details: "Size restrictions may apply"
              },
              {
                type: "Carry-On",
                isIncluded: firstSegment.travellerCabinLuggage[0]?.luggageAllowance.maxPiece > 0,
                pieces: firstSegment.travellerCabinLuggage[0]?.luggageAllowance.maxPiece,
                icon: (
                  <svg
                    className="size-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                ),
                details: "Size restrictions may apply"
              },
              {
                type: "Checked Baggage",
                isIncluded: firstSegment.travellerCheckedLuggage[0]?.luggageAllowance.maxPiece > 0,
                pieces: firstSegment.travellerCheckedLuggage[0]?.luggageAllowance.maxPiece,
                icon: (
                  <svg
                    className="size-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                ),
                details: "Weight restrictions may apply"
              }
            ].filter(item => item.isIncluded).map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <p className="font-medium">{item.type}</p>
                </div>
                <p className="text-sm text-gray-600">
                  Included {item.pieces ? `(${item.pieces} piece)` : ""} ({item.details})
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-lg mb-4">Flight Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {segments.map((segment, segmentIndex) => (
              segment.legs.map((leg, legIndex) => (
                leg.amenities?.map((amenity, amenityIndex) => (
                  <div key={`${segmentIndex}-${legIndex}-${amenityIndex}`} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {amenity.category === "AIRCRAFT" && (
                        <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      {amenity.category === "ENTERTAINMENT" && (
                        <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {amenity.category === "FOOD" && (
                        <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      <p className="font-medium">{amenity.category.charAt(0) + amenity.category.slice(1).toLowerCase()}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {amenity.model && `Aircraft: ${amenity.model}`}
                      {amenity.cost && `${amenity.cost.charAt(0).toUpperCase() + amenity.cost.slice(1)}`}
                      {amenity.type && typeof amenity.type === 'string' && `${amenity.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
                    </p>
                  </div>
                ))
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
