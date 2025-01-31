import { ChatCompletionTool } from "openai/resources/index.mjs";

export type AllowedFlightSearchTools =
  | "searchAirports"
  | "searchFlights"
  | "getFlightDetails"
  | "confirmBooking";

export const flightSearchTools: ChatCompletionTool[] = [
  {
    function: {
      name: "searchAirports",
      description: "Get airport suggestions based on a search query",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    },
    type: "function",
  },
  {
    function: {
      name: "searchFlights",
      description: "Search for flights between airports",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["ONEWAY", "ROUNDTRIP", "MULTISTOP"],
            description: "The type of trip",
          },
          adults: {
            type: "number",
            description: "Number of adults",
          },
          cabinClass: {
            type: "string",
            enum: ["ECONOMY", "BUSINESS", "FIRST", "PREMIUM_ECONOMY"],
            description: "Class of the cabin",
          },
          children: {
            type: "number",
            description: "Number of children",
          },
          from: {
            type: "string",
            description: "Departure airport",
          },
          to: {
            type: "string",
            description: "Destination airport",
          },
          fromCountry: {
            type: "string",
            description: "Country of departure",
          },
          toCountry: {
            type: "string",
            description: "Country of destination",
          },
          depart: {
            type: "string",
            description: "Departure date",
          },
          return: {
            type: "string",
            description: "Return date",
            optional: true,
          },
          sort: {
            type: "string",
            enum: ["CHEAPEST", "FASTEST", "BEST"],
            description: "Sorting preference",
          },
          enableVI: {
            type: "number",
            description: "Enable VI",
          },
          stops: {
            type: "number",
            description: "Number of stops",
            optional: true,
          },
          depTimeInt: {
            type: "string",
            description: "Departure time interval",
            optional: true,
          },
          arrTimeInt: {
            type: "string",
            description: "Arrival time interval",
            optional: true,
          },
          duration: {
            type: "number",
            description: "Flight duration",
            optional: true,
          },
          page: {
            type: "number",
            description: "Page number",
            optional: true,
          },
          limit: {
            type: "number",
            description: "Limit results per page",
            optional: true,
            default: 10,
          },
        },
        required: [
          "type",
          "adults",
          "cabinClass",
          "children",
          "from",
          "to",
          "fromCountry",
          "toCountry",
          "depart",
          "sort",
          "enableVI",
        ],
      },
    },
    type: "function",
  },
  {
    function: {
      name: "getFlightDetails",
      description: "Get detailed information about a specific flight",
      parameters: {
        type: "object",
        properties: {
          flightId: {
            type: "string",
            description: "Unique ID of the flight",
          },
          excludedAncillaries: {
            type: "string",
            description: "Ancillaries to exclude",
          },
          priceInSearch: {
            type: "string",
            description: "Price details from search",
          },
        },
        required: ["flightId", "excludedAncillaries", "priceInSearch"],
      },
    },
    type: "function",
  },
  {
    function: {
      name: "confirmBooking",
      description: "Confirm a flight booking with passenger details",
      parameters: {
        type: "object",
        properties: {
          flightNumber: {
            type: "string",
            description: "Flight number",
          },
          flightId: {
            type: "string",
            description: "Unique ID of the flight",
          },
          passengerName: {
            type: "string",
            description: "Passenger's full name",
          },
          passengerEmail: {
            type: "string",
            description: "Passenger's email address",
          },
          passengerPhone: {
            type: "string",
            description: "Passenger's phone number",
          },
        },
        required: [
          "flightNumber",
          "flightId",
          "passengerName",
          "passengerEmail",
          "passengerPhone",
        ],
      },
    },
    type: "function",
  },
];
