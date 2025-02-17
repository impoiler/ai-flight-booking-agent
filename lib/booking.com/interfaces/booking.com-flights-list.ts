export interface BookingComFlightsList {
  aggregation: Aggregation
  flightOffers: FlightOffer[]
  flightDeals: FlightDeal[]
  atolProtectedStatus: string
  searchId: string
  banners: any[]
  displayOptions: DisplayOptions
  isOffersCabinClassExtended: boolean
  cabinClassExtension: CabinClassExtension
  searchCriteria: SearchCriteria
}

export interface Aggregation {
  totalCount: number
  filteredTotalCount: number
  stops: Stop[]
  airlines: Airline[]
  departureIntervals: DepartureInterval[]
  flightTimes: FlightTime[]
  shortLayoverConnection: ShortLayoverConnection
  durationMin: number
  durationMax: number
  minPrice: MinPrice3
  minRoundPrice: MinRoundPrice
  minPriceFiltered: MinPriceFiltered
  baggage: Baggage[]
  budget: Budget
  budgetPerAdult: BudgetPerAdult
  duration: Duration[]
  filtersOrder: any[]
}

export interface Stop {
  numberOfStops: number
  count: number
  minPrice: MinPrice
  minPriceRound: MinPriceRound
}

export interface MinPrice {
  currencyCode: string
  units: number
  nanos: number
}

export interface MinPriceRound {
  currencyCode: string
  units: number
  nanos: number
}

export interface Airline {
  name: string
  logoUrl: string
  iataCode: string
  count: number
  minPrice: MinPrice2
}

export interface MinPrice2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface DepartureInterval {
  start: string
  end: string
}

export interface FlightTime {
  arrival: Arrival[]
  departure: Departure[]
}

export interface Arrival {
  start: string
  end: string
  count: number
}

export interface Departure {
  start: string
  end: string
  count: number
}

export interface ShortLayoverConnection {
  count: number
}

export interface MinPrice3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface MinRoundPrice {
  currencyCode: string
  units: number
  nanos: number
}

export interface MinPriceFiltered {
  currencyCode: string
  units: number
  nanos: number
}

export interface Baggage {
  paramName: string
  count: number
  enabled: boolean
  baggageType: string
}

export interface Budget {
  paramName: string
  min: Min
  max: Max
}

export interface Min {
  currencyCode: string
  units: number
  nanos: number
}

export interface Max {
  currencyCode: string
  units: number
  nanos: number
}

export interface BudgetPerAdult {
  paramName: string
  min: Min2
  max: Max2
}

export interface Min2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Max2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Duration {
  min: number
  max: number
  durationType: string
  enabled: boolean
  paramName: string
}

export interface FlightOffer {
  token: string
  segments: Segment[]
  priceBreakdown: PriceBreakdown
  travellerPrices: TravellerPrice[]
  priceDisplayRequirements: any[]
  pointOfSale: string
  tripType: string
  posMismatch: PosMismatch
  includedProductsBySegment: IncludedProductsBySegment[][]
  includedProducts: IncludedProducts
  extraProducts: ExtraProduct[]
  offerExtras: OfferExtras
  ancillaries: Ancillaries
  brandedFareInfo?: BrandedFareInfo
  appliedDiscounts: any[]
  offerKeyToHighlight: string
  extraProductDisplayRequirements: ExtraProductDisplayRequirements
  badges?: Badge[]
}

export interface Segment {
  departureAirport: DepartureAirport
  arrivalAirport: ArrivalAirport
  departureTime: string
  arrivalTime: string
  legs: Leg[]
  totalTime: number
  travellerCheckedLuggage: TravellerCheckedLuggage[]
  travellerCabinLuggage: TravellerCabinLuggage[]
  isAtolProtected: boolean
  showWarningDestinationAirport: boolean
  showWarningOriginAirport: boolean
}

export interface DepartureAirport {
  type: string
  code: string
  name: string
  city: string
  cityName: string
  country: string
  countryName: string
}

export interface ArrivalAirport {
  type: string
  code: string
  name: string
  city: string
  cityName: string
  country: string
  countryName: string
  province: string
}

export interface Leg {
  departureTime: string
  arrivalTime: string
  departureAirport: DepartureAirport2
  arrivalAirport: ArrivalAirport2
  cabinClass: string
  flightInfo: FlightInfo
  carriers: string[]
  carriersData: CarriersDaum[]
  totalTime: number
  flightStops: any[]
  amenities: Amenity[]
  departureTerminal?: string
  arrivalTerminal?: string
}

export interface DepartureAirport2 {
  type: string
  code: string
  name: string
  city: string
  cityName: string
  country: string
  countryName: string
}

export interface ArrivalAirport2 {
  type: string
  code: string
  name: string
  city: string
  cityName: string
  country: string
  countryName: string
  province: string
}

export interface FlightInfo {
  facilities: any[]
  flightNumber: number
  planeType: string
  carrierInfo: CarrierInfo
}

export interface CarrierInfo {
  operatingCarrier: string
  marketingCarrier: string
  operatingCarrierDisclosureText: string
}

export interface CarriersDaum {
  name: string
  code: string
  logo: string
}

export interface Amenity {
  category: string
  model?: string
  cost?: string
  type: any
}

export interface TravellerCheckedLuggage {
  travellerReference: string
  luggageAllowance: LuggageAllowance
}

export interface LuggageAllowance {
  luggageType: string
  ruleType: string
  maxTotalWeight?: number
  massUnit: string
  maxPiece: number
  maxWeightPerPiece?: number
}

export interface TravellerCabinLuggage {
  travellerReference: string
  luggageAllowance: LuggageAllowance2
  personalItem: boolean
}

export interface LuggageAllowance2 {
  luggageType: string
  maxPiece: number
  maxWeightPerPiece: number
  massUnit: string
  sizeRestrictions: SizeRestrictions
}

export interface SizeRestrictions {
  maxLength: number
  maxWidth: number
  maxHeight: number
  sizeUnit: string
}

export interface PriceBreakdown {
  total: Total
  baseFare: BaseFare
  fee: Fee
  tax: Tax
  totalRounded: TotalRounded
  moreTaxesAndFees: MoreTaxesAndFees
  discount: Discount
  totalWithoutDiscount: TotalWithoutDiscount
  totalWithoutDiscountRounded: TotalWithoutDiscountRounded
  carrierTaxBreakdown: CarrierTaxBreakdown[]
}

export interface Total {
  currencyCode: string
  units: number
  nanos: number
}

export interface BaseFare {
  currencyCode: string
  units: number
  nanos: number
}

export interface Fee {
  currencyCode: string
  units: number
  nanos: number
}

export interface Tax {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalRounded {
  currencyCode: string
  nanos: number
  units: number
}

export interface MoreTaxesAndFees {}

export interface Discount {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscount {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscountRounded {
  currencyCode: string
  nanos: number
  units: number
}

export interface CarrierTaxBreakdown {
  carrier: Carrier
  avgPerAdult: AvgPerAdult
  avgPerInfant?: AvgPerInfant
}

export interface Carrier {
  name: string
  code: string
  logo: string
}

export interface AvgPerAdult {
  currencyCode: string
  units: number
  nanos: number
}

export interface AvgPerInfant {
  currencyCode: string
  units: number
  nanos: number
}

export interface TravellerPrice {
  travellerPriceBreakdown: TravellerPriceBreakdown
  travellerReference: string
  travellerType: string
}

export interface TravellerPriceBreakdown {
  total: Total2
  baseFare: BaseFare2
  fee: Fee2
  tax: Tax2
  totalRounded: TotalRounded2
  moreTaxesAndFees: MoreTaxesAndFees2
  discount: Discount2
  totalWithoutDiscount: TotalWithoutDiscount2
  totalWithoutDiscountRounded: TotalWithoutDiscountRounded2
}

export interface Total2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface BaseFare2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Fee2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Tax2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalRounded2 {
  currencyCode: string
  nanos: number
  units: number
}

export interface MoreTaxesAndFees2 {}

export interface Discount2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscount2 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscountRounded2 {
  currencyCode: string
  nanos: number
  units: number
}

export interface PosMismatch {
  detectedPointOfSale: string
  isPOSMismatch: boolean
  offerSalesCountry: string
}

export interface IncludedProductsBySegment {
  travellerReference: string
  travellerProducts: TravellerProduct[]
}

export interface TravellerProduct {
  type: string
  product?: Product
}

export interface Product {
  luggageType: string
  ruleType?: string
  maxTotalWeight?: number
  massUnit: string
  maxPiece: number
  maxWeightPerPiece?: number
  sizeRestrictions?: SizeRestrictions2
}

export interface SizeRestrictions2 {
  maxLength: number
  maxWidth: number
  maxHeight: number
  sizeUnit: string
}

export interface IncludedProducts {
  areAllSegmentsIdentical: boolean
  segments: Segment2[][]
}

export interface Segment2 {
  luggageType: string
  maxPiece: number
  piecePerPax: number
  maxWeightPerPiece?: number
  massUnit?: string
  sizeRestrictions?: SizeRestrictions3
  ruleType?: string
  maxTotalWeight?: number
}

export interface SizeRestrictions3 {
  maxLength: number
  maxWidth: number
  maxHeight: number
  sizeUnit: string
}

export interface ExtraProduct {
  type: string
  priceBreakdown: PriceBreakdown2
}

export interface PriceBreakdown2 {
  total: Total3
  baseFare: BaseFare3
  fee: Fee3
  tax: Tax3
  moreTaxesAndFees: MoreTaxesAndFees3
  discount: Discount3
  totalWithoutDiscount: TotalWithoutDiscount3
}

export interface Total3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface BaseFare3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Fee3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Tax3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface MoreTaxesAndFees3 {}

export interface Discount3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscount3 {
  currencyCode: string
  units: number
  nanos: number
}

export interface OfferExtras {
  flexibleTicket: FlexibleTicket
}

export interface FlexibleTicket {
  airProductReference: string
  travellers: string[]
  recommendation: Recommendation
  priceBreakdown: PriceBreakdown3
  supplierInfo: SupplierInfo
}

export interface Recommendation {
  recommended: boolean
  confidence: string
}

export interface PriceBreakdown3 {
  total: Total4
  baseFare: BaseFare4
  fee: Fee4
  tax: Tax4
  totalRounded: TotalRounded3
  moreTaxesAndFees: MoreTaxesAndFees4
  discount: Discount4
  totalWithoutDiscount: TotalWithoutDiscount4
  totalWithoutDiscountRounded: TotalWithoutDiscountRounded3
}

export interface Total4 {
  currencyCode: string
  units: number
  nanos: number
}

export interface BaseFare4 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Fee4 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Tax4 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalRounded3 {
  currencyCode: string
  nanos: number
  units: number
}

export interface MoreTaxesAndFees4 {}

export interface Discount4 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscount4 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscountRounded3 {
  currencyCode: string
  nanos: number
  units: number
}

export interface SupplierInfo {
  name: string
  termsUrl: string
  privacyPolicyUrl: string
}

export interface Ancillaries {
  flexibleTicket: FlexibleTicket2
}

export interface FlexibleTicket2 {
  airProductReference: string
  travellers: string[]
  priceBreakdown: PriceBreakdown4
  preSelected: boolean
  recommendation: Recommendation2
  supplierInfo: SupplierInfo2
}

export interface PriceBreakdown4 {
  total: Total5
  baseFare: BaseFare5
  fee: Fee5
  tax: Tax5
  moreTaxesAndFees: MoreTaxesAndFees5
  discount: Discount5
  totalWithoutDiscount: TotalWithoutDiscount5
}

export interface Total5 {
  currencyCode: string
  units: number
  nanos: number
}

export interface BaseFare5 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Fee5 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Tax5 {
  currencyCode: string
  units: number
  nanos: number
}

export interface MoreTaxesAndFees5 {}

export interface Discount5 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscount5 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Recommendation2 {
  recommended: boolean
  confidence: string
}

export interface SupplierInfo2 {
  name: string
  termsUrl: string
  privacyPolicyUrl: string
}

export interface BrandedFareInfo {
  fareName: string
  cabinClass: string
  features: Feature[]
  fareAttributes: any[]
  nonIncludedFeaturesRequired: boolean
  nonIncludedFeatures: any[]
  sellableFeatures: any[]
}

export interface Feature {
  featureName: string
  category: string
  code: string
  label: string
  availability: string
}

export interface ExtraProductDisplayRequirements {}

export interface Badge {
  text: string
  variant: string
  type: string
}

export interface FlightDeal {
  key: string
  offerToken: string
  price: Price
  travellerPrices: TravellerPrice2[]
}

export interface Price {
  currencyCode: string
  units: number
  nanos: number
}

export interface TravellerPrice2 {
  travellerPriceBreakdown: TravellerPriceBreakdown2
  travellerReference: string
  travellerType: string
}

export interface TravellerPriceBreakdown2 {
  total: Total6
  baseFare: BaseFare6
  fee: Fee6
  tax: Tax6
  totalRounded: TotalRounded4
  moreTaxesAndFees: MoreTaxesAndFees6
  discount: Discount6
  totalWithoutDiscount: TotalWithoutDiscount6
  totalWithoutDiscountRounded: TotalWithoutDiscountRounded4
}

export interface Total6 {
  currencyCode: string
  units: number
  nanos: number
}

export interface BaseFare6 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Fee6 {
  currencyCode: string
  units: number
  nanos: number
}

export interface Tax6 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalRounded4 {
  currencyCode: string
  nanos: number
  units: number
}

export interface MoreTaxesAndFees6 {}

export interface Discount6 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscount6 {
  currencyCode: string
  units: number
  nanos: number
}

export interface TotalWithoutDiscountRounded4 {
  currencyCode: string
  nanos: number
  units: number
}

export interface DisplayOptions {
  brandedFaresShownByDefault: boolean
  directFlightsOnlyFilterIgnored: boolean
  hideFlexiblePricesBanner: boolean
}

export interface CabinClassExtension {}

export interface SearchCriteria {
  cabinClass: string
}
