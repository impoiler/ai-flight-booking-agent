import { BookingComAirports } from "./interfaces/booking.com-airports-list";
import { BookingComFlightDetails } from "./interfaces/booking.com-flight-details";
import { BookingComFlightsList } from "./interfaces/booking.com-flights-list";

// Types for API parameters
interface FlightSearchParams {
  type: "ONEWAY" | "ROUND";
  adults: number;
  cabinClass: "ECONOMY" | "BUSINESS" | "FIRST" | "PREMIUM_ECONOMY";
  children: number;
  from: string;
  to: string;
  fromCountry: string;
  toCountry: string;
  depart: string;
  return?: string;
  sort: "CHEAPEST" | "FASTEST" | "BEST";
  enableVI: number;
  stops?: number;
  depTimeInt?: string;
  arrTimeInt?: string;
  duration?: number;
  page?: number;
  limit?: number;
}

interface FlightDetailsParams {
  flightId: string;
  excludedAncillaries: string;
  priceInSearch: string;
}

class BookingAPIClient {
  private static instance: BookingAPIClient;
  private baseUrl = "https://flights.booking.com/api";
  private headers: HeadersInit = {
    accept: "*/*",
    "accept-language": "en-GB,en;q=0.9",
    "x-booking-affiliate-id": "304142",
    "x-booking-flights-client-hints": "price_change_v2",
    "x-flights-context-name": "search_results",
    "x-flights-context-pos": "in",
  };

  private constructor(customHeaders?: HeadersInit) {
    if (customHeaders) {
      this.headers = { ...this.headers, ...customHeaders };
    }
  }

  public static getInstance(customHeaders?: HeadersInit): BookingAPIClient {
    if (!BookingAPIClient.instance) {
      BookingAPIClient.instance = new BookingAPIClient(customHeaders);
    }
    return BookingAPIClient.instance;
  }

  async searchFlights(
    params: FlightSearchParams
  ): Promise<BookingComFlightsList> {
    const queryParams = new URLSearchParams({
      type: params.type,
      adults: params.adults?.toString() ?? '',
      cabinClass: params.cabinClass,
      children: params.children?.toString() ?? '',
      from: params.from,
      to: params.to,
      fromCountry: params.fromCountry,
      toCountry: params.toCountry,
      depart: params.depart,
      sort: params.sort,
      enableVI: params.enableVI?.toString() ?? '',
      limit: "3",
      ...(params.return && { return: params.return }),
      ...(params.stops !== undefined && { stops: params.stops?.toString() ?? '' }),
      ...(params.depTimeInt && { depTimeInt: params.depTimeInt }),
      ...(params.arrTimeInt && { arrTimeInt: params.arrTimeInt }),
      ...(params.duration !== undefined && { duration: params.duration?.toString() ?? '' }),
      ...(params.page !== undefined && { page: params.page?.toString() ?? '' }),
      ...(params.limit !== undefined && { limit: params.limit?.toString() ?? '' }),
      ...(params.duration && { duration: params.duration.toString() }),
      ...(params.page !== undefined && { page: params.page.toString() }),
    });

    const response = await fetch(
      `${this.baseUrl}/flights/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as BookingComFlightsList;
    

    return result;
  }

  async getFlightDetails(
    params: FlightDetailsParams
  ): Promise<BookingComFlightDetails> {
    const queryParams = new URLSearchParams({
      excludedAncillaries: params.excludedAncillaries,
      priceInSearch: params.priceInSearch,
    });

    const response = await fetch(
      `${this.baseUrl}/flight/${params.flightId}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async searchAirports(query: string): Promise<BookingComAirports> {
    const response = await fetch(
      `${this.baseUrl}/autocomplete/en?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const bookingClient = BookingAPIClient.getInstance();
