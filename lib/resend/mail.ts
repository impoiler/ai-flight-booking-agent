import { Resend } from "resend";

class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendFlightConfirmation(
    to: string,
    flightDetails: {
      flightNumber: string;
      flightId: string;
      passengerName: string;
      passengerEmail: string;
      passengerPhone: string;
      bookingTime?: string;
    }
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: "AI Flights <flights@n.tini.fyi>",
        to: [to],
        subject: `Flight Booking Confirmation - ${flightDetails.flightNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Flight Booking Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.5; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
                <tr>
                  <td align="center" style="padding: 32px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="padding: 32px;">
                          <div style="text-align: center; margin-bottom: 32px;">
                            <div style="display: inline-block; background-color: #dcfce7; color: #15803d; padding: 6px 16px; border-radius: 9999px; margin-bottom: 16px;">
                              <span style="display: inline-block; width: 8px; height: 8px; background-color: #22c55e; border-radius: 9999px; margin-right: 8px; vertical-align: middle;"></span>
                              Booking Confirmed
                            </div>
                            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937;">Thank You!</h1>
                            <p style="color: #4b5563; margin: 0 0 8px 0;">Your flight has been successfully booked</p>
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">Booked on ${flightDetails.bookingTime || new Date().toLocaleString()}</p>
                          </div>

                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                            <tr>
                              <td style="padding: 24px;">
                                <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 16px 0; color: #1f2937;">Flight Details</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="color: #4b5563; padding-bottom: 12px;">Flight Number</td>
                                    <td style="font-weight: 500; text-align: right; padding-bottom: 12px;">${flightDetails.flightNumber}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #4b5563; padding-bottom: 12px;">Booking ID</td>
                                    <td style="font-weight: 500; text-align: right; padding-bottom: 12px;">${flightDetails.flightId}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px;">
                            <tr>
                              <td style="padding: 24px;">
                                <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 16px 0; color: #1f2937;">Passenger Information</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="color: #4b5563; padding-bottom: 12px;">Name</td>
                                    <td style="font-weight: 500; text-align: right; padding-bottom: 12px;">${flightDetails.passengerName}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #4b5563; padding-bottom: 12px;">Email</td>
                                    <td style="font-weight: 500; text-align: right; padding-bottom: 12px;">${flightDetails.passengerEmail}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #4b5563;">Phone</td>
                                    <td style="font-weight: 500; text-align: right;">${flightDetails.passengerPhone}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
                            <p style="margin: 0;">If you have any questions, please contact our support team.</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error sending flight confirmation email:", error);
      throw error;
    }
  }
}

export const mail = EmailService.getInstance();
