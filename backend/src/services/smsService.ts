import { env } from '../config/env';

// Twilio is an optional dependency. It is loaded lazily so the backend runs
// fine without it (and without SMS credentials) during local development.
let twilioClient: any = null;
let triedLoadingTwilio = false;

const isTwilioConfigured = () =>
  Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER);

const getTwilioClient = async () => {
  if (!isTwilioConfigured()) {
    return null;
  }
  if (!triedLoadingTwilio) {
    triedLoadingTwilio = true;
    try {
      const mod = await import('twilio');
      const twilio = (mod as any).default ?? mod;
      twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    } catch (error) {
      console.warn('[smsService] twilio package not available; falling back to dev mode.', error);
      twilioClient = null;
    }
  }
  return twilioClient;
};

export const smsService = {
  isConfigured: isTwilioConfigured,

  /**
   * Sends an SMS. Returns true when it was actually dispatched via a provider,
   * false when running in dev fallback (no provider configured).
   */
  async send(to: string, message: string): Promise<boolean> {
    const client = await getTwilioClient();
    if (!client) {
      // Dev fallback: no provider configured. The caller decides whether to
      // surface the code to the client; here we just log it.
      console.log(`[smsService:DEV] SMS to ${to}: ${message}`);
      return false;
    }

    await client.messages.create({
      to,
      from: env.TWILIO_FROM_NUMBER,
      body: message
    });
    return true;
  }
};
