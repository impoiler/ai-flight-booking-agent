export type BookingComAirports = Array<{
  type: string;
  name: string;
  code: string;
  city: string;
  cityName: string;
  regionName: string;
  country: string;
  countryName: string;
  countryNameShort: string;
  photoUri: string;
  distanceToCity: {
    value: number;
    unit: string;
  };
  parent: string;
}>;
