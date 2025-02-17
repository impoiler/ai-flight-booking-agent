/* eslint-disable @next/next/no-img-element */
"use client";

import cx from "classnames";
import { format } from "date-fns";

export type FlightInformation = {
  data: {
    isFireFly: boolean;
    itemKey: string;
    priceKey: string;
    error: any;
    requestId: string;
    airlineImagePath: string;
    passportRequired: boolean;
    fltTimeChg: boolean;
    isSeatEligible: boolean;
    changesAllowed: any;
    priceChg: boolean;
    paxMinimumAge: any;
    disinsectionURL: any;
    airline: Array<{
      name: string;
      code: string;
      baggageFeeUrl: string;
      smallImage: string;
      phoneNumber: string;
      baggageContentAvailable: boolean;
    }>;
    fareBrandsInfo: any;
    slices: Array<{
      id: number;
      durationInMinutes: string;
      isOvernight: boolean;
      overnightConnection: any;
      segments: Array<{
        cabinClass: string;
        id: number;
        arrivalInfo: {
          airport: {
            code: string;
            name: string;
            city: string;
            country: string;
            state: any;
          };
          time: {
            dateTime: string;
          };
        };
        departInfo: {
          airport: {
            code: string;
            name: string;
            city: string;
            country: string;
            state: any;
          };
          time: {
            dateTime: string;
          };
        };
        flightNumber: string;
        marketingAirline: string;
        stopQuantity: number;
        isOvernight: boolean;
        durationInMinutes: string;
        operatingAirline: string;
        equipment: string;
        displayText: {
          equipmentText: string;
          operatedByText: string;
        };
        equipmentName: string;
        brand: {
          brandId: any;
          id: number;
          name: string;
        };
      }>;
    }>;
    price: Array<{
      amount: number;
      type: string;
      taxesAndFees: number;
      fees: any;
      ticketingAirline: string;
      baseFare: number;
      fareInfo: any;
      currencyCode: string;
      insuranceCost: any;
      componentItinPricingInfo: Array<any>;
    }>;
    fareRules: {
      airFareRules: Array<any>;
    };
    voidWindowInfo: any;
    isFused: boolean;
  };
  status: boolean;
  message: string;
};

export function FlightsDetails({ result }: { result: FlightInformation }) {
  const { data } = result;
  const { airline, slices, price } = data;
  const totalPrice = price.find((p) => p.type === "TOTAL_PRICE");

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
              src={`https://s1.pclncdn.com/design-assets/fly/carrier-logos/${airline[0].smallImage}`}
              alt={airline[0].name}
              className="size-10 object-contain"
            />
            <div>
              <span className="font-bold text-lg">{airline[0].name}</span>
              <p className="text-sm text-gray-600">
                Flight {slices[0].segments[0].flightNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {totalPrice?.amount} {totalPrice?.currencyCode}
            </div>
            <p className="text-sm text-gray-600">Total Price</p>
          </div>
        </div>
        {slices.map((slice, index) => (
          <div key={index} className="border-t border-gray-200 pt-4">
            {slice.segments.map((segment, segIndex) => (
              <div key={segIndex} className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {format(
                        new Date(segment.departInfo.time.dateTime),
                        "HH:mm"
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {segment.departInfo.airport.city} (
                      {segment.departInfo.airport.code})
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600">
                      {(parseInt(segment.durationInMinutes) / 60).toFixed(2)}{" "}
                      hours
                    </div>
                    <div className="relative w-full h-[2px] bg-gray-300 my-2">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        ✈️
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {segment.stopQuantity === 0
                        ? "Non-stop"
                        : `${segment.stopQuantity} stop(s)`}
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-lg">
                      {format(
                        new Date(segment.arrivalInfo.time.dateTime),
                        "HH:mm"
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {segment.arrivalInfo.airport.city} (
                      {segment.arrivalInfo.airport.code})
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
              <span className="font-medium">
                ${totalPrice?.baseFare} {totalPrice?.currencyCode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-medium">
                ${totalPrice?.taxesAndFees} {totalPrice?.currencyCode}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">
                ${totalPrice?.amount} {totalPrice?.currencyCode}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-lg mb-4">Flight Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Flight Type</span>
              <span className="font-medium">
                {slices[0].segments.length > 1
                  ? `${slices[0].segments.length - 1} Stop(s)`
                  : "Non-stop"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aircraft</span>
              <span className="font-medium">
                {slices[0].segments[0].equipmentName ?? "NA"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cabin Class</span>
              <span className="font-medium">
                {slices[0].segments[0].cabinClass}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-lg mb-4">Baggage Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
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
                <p className="font-medium">Personal Item</p>
              </div>
              <p className="text-sm text-gray-600">
                Included (size restrictions may apply)
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
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
                <p className="font-medium">Carry-On</p>
              </div>
              <p className="text-sm text-gray-600">
                Not included (additional fees may apply)
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
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
                <p className="font-medium">Checked Baggage</p>
              </div>
              <p className="text-sm text-gray-600">
                Not included (additional fees may apply)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
