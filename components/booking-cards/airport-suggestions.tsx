"use client";

import { BookingComAirports } from "@/lib/booking.com/interfaces/booking.com-airports-list";
import cx from "classnames";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function BookingDotComAirportList({
  airports,
  onChange,
}: {
  airports?: BookingComAirports;
  onChange?: (code: string) => void;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 rounded-2xl px-4 skeleton-bg max-w-full"
      )}
    >
      {airports && airports.length > 0 ? (
        <RadioGroup className="flex flex-col gap-3" onValueChange={onChange}>
          <h2 className="text-lg font-semibold mb-2">Select Airport</h2>
          {airports
            .filter((airport) => airport.type === "AIRPORT")
            .map((airport) => (
              <Label
                htmlFor={airport.code}
                key={airport.code}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-slate-50 hover:text-black transition-colors">
                  <RadioGroupItem
                    value={airport.code}
                    id={airport.code}
                    className="mr-4"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 bg-blue-50 rounded-full">
                      {airport.photoUri ? (
                        <img
                          src={airport.photoUri}
                          alt={airport.name}
                          className="size-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-lg">✈️</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium">{airport.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {airport.cityName}{airport.cityName !== airport.countryName && `, ${airport.countryName}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Label>
            ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            No airport suggestions found.
          </p>
        </div>
      )}
    </div>
  );
}
