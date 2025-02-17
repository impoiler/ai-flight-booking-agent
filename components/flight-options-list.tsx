/* eslint-disable @next/next/no-img-element */
"use client";

import cx from "classnames";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export type FlightsOptions = {
  data: {
    isFireFly: boolean;
    airline: Array<{
      code: string;
      name: string;
      smallImage: string;
      baggageFeeUrl: string;
      phoneNumber: string;
      baggageContentAvailable: boolean;
    }>;
    airport: Array<{
      code: string;
      city: string;
      country: string;
      name: string;
      state: any;
      isoCountryCode: string;
    }>;
    listings: Array<{
      __typename: string;
      itemKey: string;
      priceKey: string;
      isFused: boolean;
      isInterline: boolean;
      totalPriceWithDecimal: {
        price: number;
      };
      id: string;
      groupId: any;
      refId: any;
      isSaleEligible: boolean;
      seatsAvailable: number;
      marketingAirlines: Array<{
        code: string;
      }>;
      fareBrands: Array<{
        ancillaries: Array<{
          name: string;
          offerType: string;
        }>;
        name: string;
        isSelected: boolean;
        price: Array<{
          amount: number;
          currencyCode: string;
          type: string;
        }>;
        priceKey: string;
      }>;
      slices: Array<{
        uniqueSliceId: any;
        sliceKey: string;
        sliceRefId: number;
        isOvernight: boolean;
        segments: Array<{
          id: number;
          cabinClass: string;
          uniqueSegId: any;
          departInfo: {
            airport: {
              code: string;
              name: string;
            };
            time: {
              dateTime: string;
            };
          };
          arrivalInfo: {
            airport: {
              code: string;
              name: string;
            };
            time: {
              dateTime: string;
            };
          };
          operatingAirline: string;
          marketingAirline: string;
          equipmentName: string;
          equipment: string;
          duration: number;
          stopQuantity: number;
          flightNumber: string;
          isSubjectToGovtApproval: boolean;
          isOvernight: boolean;
          brand: {
            brandAttributes: Array<{
              inclusion: string;
              type: string;
            }>;
          };
          displayText: {
            operatedByText?: string;
            flightNumber: any;
            displayCabinName: any;
            planeChangeText: any;
            differentAirportText: any;
            layoverText: any;
            equipmentText: string;
          };
          segmentNote: any;
          bkgClass: any;
          brandId: string;
        }>;
        durationInMinutes: string;
        displayText: {
          operatedByText?: string;
        };
        merchandising: Array<string>;
        id: number;
        isSelected: any;
        departing: any;
        arrival: any;
      }>;
      voidWindowInfo?: {
        timeStamp: string;
        tzDesignator: any;
        hoursLeft: string;
      };
      airlines: Array<{
        marketingAirline: any;
        name: string;
        image: string;
      }>;
      allFareBrandAttributes: Array<
        Array<{
          inclusion: string;
          description: string;
          type: string;
        }>
      >;
      allFareBrandNames: Array<string>;
      candidateId: any;
      candidateKey: any;
      merchandising: Array<string>;
      saleSavings: any;
    }>;
    expressDeal: {
      displayableCarriers: Array<any>;
      candidates: Array<any>;
    };
    filterDefaults: {
      minTotalFareWithTaxesAndFees: number;
      maxTotalFareWithTaxesAndFees: number;
      airlines: Array<{
        value: string;
      }>;
      airports: Array<{
        originAirports: Array<{
          value: string;
        }>;
        destinationAirports: Array<{
          value: string;
        }>;
      }>;
      time: Array<{
        sliceRefId: number;
        sliceDurationMax: number;
        sliceDurationMin: number;
        minTakeoffTime: number;
        maxTakeoffTime: number;
        minLandingTime: number;
        maxLandingTime: number;
      }>;
      numOfStops: Array<{
        secondaryLabel: string;
        primaryLabel: string;
        value: string;
      }>;
    };
    listingsMetaData: {
      totalFilteredItineraries: number;
      totalItineraries: number;
      searchSessionKey: string;
      clientSessionId: any;
      requestId: string;
      lowerBound: number;
      searchId: any;
      airlineImagePath: string;
      hasExpressDeal: boolean;
      hasAirCanada: any;
      minimumRetailPrice: number;
      minDurationPrice: any;
      nonStopPrice: number;
      tripType: string;
      minVoidWindowClose: any;
      hasClosedUserGroupDeals: any;
    };
    travelInsurance: any;
    error: any;
    displayableCarriers: Array<any>;
    expressDealsCandidates: Array<any>;
    brandReference: Array<{
      brandId: string;
      tier: any;
      name: string;
      brandAttributes: Array<{
        type: string;
        description: string;
        inclusion: string;
      }>;
    }>;
  };
  meta: {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPage: number;
  };
  status: boolean;
  message: string;
};

export type minimalFlightsOptions = {
  id: string;
  itemKey: string;
  priceKey: string;
  price: number;
  airline: {
    name: string;
    logo: string;
  };
  departInfo: {
    airport: {
      code: string;
      name: string;
    };
    time: {
      dateTime: string;
    };
  };
  arrivalInfo: {
    airport: {
      code: string;
      name: string;
    };
    time: {
      dateTime: string;
    };
  };
  duration: number;
  stopQuantity: number;
  flightNumber: string;
};

export function FlightsOptionsList({
  result,
  onChange,
}: {
  result?: minimalFlightsOptions[];
  onChange?: (flight: minimalFlightsOptions) => void;
}) {
  const [displayCount, setDisplayCount] = useState(10);

  const displayedResults =
    result && Array.isArray(result) ? result?.slice(0, displayCount) : [];
  const hasMore = result && result?.length > displayCount;

  return (
    <div
      className={cx(
        "flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-full"
      )}
    >
      {result && result.length > 0 ? (
        <>
          <RadioGroup
            className="flex flex-col gap-3"
            onValueChange={(id) => {
              const flight = result.find((f) => f.id === id);
              if (flight) {
                onChange?.(flight);
              }
            }}
          >
            {displayedResults?.map((item) => (
              <Label htmlFor={item.id} key={item.id} className="cursor-pointer">
                <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-slate-50 hover:text-black transition-colors">
                  <RadioGroupItem
                    value={item.id}
                    id={item.id}
                    className="mr-4"
                  />

                  <div className="flex-1 grid grid-cols-[auto_1fr_auto] gap-6 items-center">
                    {/* Airline Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://s1.pclncdn.com/design-assets/fly/carrier-logos/${item.airline.logo}?opto&auto=webp&height=96}`}
                        width={40}
                        height={40}
                        alt={item.airline.name}
                        className="object-contain"
                      />
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">
                          {item.airline.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          #{item.flightNumber}
                        </p>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="flex items-center justify-between px-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {item.departInfo.airport.code}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            item.departInfo.time.dateTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.departInfo.airport.name}
                        </p>
                      </div>

                      <div className="flex flex-col items-center px-4">
                        <div className="text-sm text-gray-500">
                          {item.duration >= 60
                            ? `${Math.floor(item.duration / 60)}h ${
                                item.duration % 60
                              }m`
                            : `${item.duration}m`}
                        </div>
                        <div className="w-32 h-[2px] bg-gray-300 my-2 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            ✈️
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.stopQuantity === 0
                            ? "Direct"
                            : `${item.stopQuantity} ${
                                item.stopQuantity === 1 ? "stop" : "stops"
                              }`}
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {item.arrivalInfo.airport.code}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            item.arrivalInfo.time.dateTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.arrivalInfo.airport.name}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        $ {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
          {hasMore && (
            <Button onClick={() => setDisplayCount((prev) => prev + 10)}>
              Show More Flights ({result.length - displayCount} remaining)
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
