/* eslint-disable @next/next/no-img-element */
"use client";

import { BookingComFlightsList } from "@/lib/booking.com/interfaces/booking.com-flights-list";
import cx from "classnames";
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function BookingDotComFlightsList({
  result,
  onChange,
}: {
  result?: BookingComFlightsList;
  onChange?: (flight: string) => void;
}) {
  const [displayCount, setDisplayCount] = useState(10);
  const displayedResults = result?.flightOffers?.slice(0, displayCount) || [];
  const hasMore =
    result?.flightOffers && result?.flightOffers?.length > displayCount;

  return (
    <div
      className={cx(
        "flex flex-col gap-4 rounded-2xl px-4 skeleton-bg max-w-full"
      )}
    >
      {result?.flightOffers && result.flightOffers.length > 0 ? (
        <>
          <RadioGroup
            className="flex flex-col gap-3"
            onValueChange={(flight) => {
              if (flight) {
                onChange?.(flight);
              }
            }}
          >
            {displayedResults?.map((offer) => {
              const firstSegment = offer.segments[0];
              const lastSegment = offer.segments[offer.segments.length - 1];
              const carrier = firstSegment.legs[0].carriersData[0];
              const totalDuration = offer.segments.reduce(
                (acc, segment) => acc + segment.totalTime,
                0
              );

              const flight = `${carrier.name} ${firstSegment.legs[0].flightInfo.flightNumber}`;

              return (
                <Label
                  htmlFor={offer.token}
                  key={offer.token}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-slate-50 hover:text-black transition-colors">
                    <RadioGroupItem
                      value={flight}
                      id={offer.token}
                      className="mr-4"
                    />

                    <div className="flex-1 grid grid-cols-[auto_1fr_auto] gap-6 items-center">
                      {/* Airline Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={`${carrier.logo}`}
                          width={40}
                          height={40}
                          alt={carrier.name}
                          className="object-contain"
                        />
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{carrier.name}</p>
                          <p className="text-sm text-gray-500">
                            #{firstSegment.legs[0].flightInfo.flightNumber}
                          </p>
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="flex items-center justify-between px-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold">
                            {firstSegment.departureAirport.code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              firstSegment.departureTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {firstSegment.departureAirport.name}
                          </p>
                        </div>

                        <div className="flex flex-col items-center px-4">
                          <div className="text-sm text-gray-500">
                            {totalDuration >= 60
                              ? `${Math.floor(totalDuration / 60)}h ${
                                  totalDuration % 60
                                }m`
                              : `${totalDuration}m`}
                          </div>
                          <div className="w-32 h-[2px] bg-gray-300 my-2 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              ✈️
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {offer.segments.length === 1
                              ? "Direct"
                              : `${offer.segments.length - 1} ${
                                  offer.segments.length === 2 ? "stop" : "stops"
                                }`}
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-semibold">
                            {lastSegment.arrivalAirport.code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              lastSegment.arrivalTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lastSegment.arrivalAirport.name}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {offer.priceBreakdown.total.currencyCode}{" "}
                          {(
                            offer.priceBreakdown.total.units +
                            offer.priceBreakdown.total.nanos / 1e9
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
          {hasMore && (
            <Button onClick={() => setDisplayCount((prev) => prev + 10)}>
              Show More Flights ({result.flightOffers.length - displayCount}{" "}
              remaining)
            </Button>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            No flights found for this route.
          </p>
        </div>
      )}
    </div>
  );
}
