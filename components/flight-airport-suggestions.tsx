"use client";

import cx from "classnames";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface WeatherAtLocation {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily_units: {
    time: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}

export type AirportSuggestions = {
  data: {
    resultCode: number;
    resultMessage: string;
    duration: number;
    serverID: string;
    searchItems: Array<{
      type: string;
      itemName: string;
      id: string;
      displayLine1: string;
      displayLine2: string;
      idWithType: string;
      stateCode: string;
      cityID: string;
      cityCode: string;
      cityName: string;
      countryCode: string;
      country: string;
      provinceName: string;
      entered: string;
      gmtOffset: string;
      timeZoneName: string;
      lat: number;
      lon: number;
      poiCategoryTypeId: number;
      displayName: string;
      rank: number;
      score: number;
      proximity: number;
      subType: string;
      airportCode: any;
      timeZoneID: number;
      fromSavedSearch: boolean;
    }>;
    source: string;
  };
  status: boolean;
  message: string;
};

export function AirportSuggestions({
  result,
  onChange,
}: {
  result?: AirportSuggestions;
  onChange?: (id: string) => void;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px]"
      )}
    >
      {result && result.data && result.data.searchItems.length > 0 ? (
        <RadioGroup className="flex flex-col gap-2" onValueChange={onChange}>
          {result.data.searchItems.map((item) => (
            <Label
              htmlFor={item.id}
              key={Math.random()}
              className="cursor-pointer"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value={item.id} id={item.id} />
                <p>{item.displayLine1}</p>
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
