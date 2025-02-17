import { Button } from "../ui/button";

interface BookingDetails {
  flightNumber: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}

export default function FlightBookingConfirmation({
  result,
}: {
  result: BookingDetails;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-white text-black shadow-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full px-4 py-1.5 mb-4">
            <div className="size-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-700 text-sm font-medium">
              Booking Confirmed
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600">
            Your flight has been successfully booked
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Booked on December 28, 2024 at 4:33 PM IST
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Flight Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Flight Number</span>
                <span className="font-medium text-gray-800">
                  {result.flightNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-medium text-gray-800">
                  {result.flightId}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Passenger Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-800">
                  {result.passengerName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-800">
                  {result.passengerEmail}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-800">
                  {result.passengerPhone}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            A confirmation email has been sent to {result.passengerEmail}
          </p>
          <div className="space-x-4">
            <Button
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => window.print()}
            >
              Print Confirmation
            </Button>
            <Button
              className="bg-white text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
              onClick={() => (window.location.href = "/")}
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
