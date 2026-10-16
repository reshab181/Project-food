// Quick push test. Usage:
//   node push-test.mjs "ExponentPushToken[xxxxxxxx]"
// Sends a single test notification straight to Expo's push service so you can
// confirm the device + Firebase (FCM) setup works, independent of the order flow.
import { Expo } from 'expo-server-sdk';

const token = process.argv[2];
if (!token) {
  console.error('Pass the device Expo push token:  node push-test.mjs "ExponentPushToken[...]"');
  process.exit(1);
}
if (!Expo.isExpoPushToken(token)) {
  console.error('That does not look like a valid Expo push token:', token);
  process.exit(1);
}

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

const run = async () => {
  const tickets = await expo.sendPushNotificationsAsync([
    {
      to: token,
      sound: 'default',
      title: 'Bam Bam test',
      body: 'If you see this, push notifications work! 🎉',
      channelId: 'orders',
      data: { test: true }
    }
  ]);
  console.log('tickets:', JSON.stringify(tickets, null, 2));

  const errored = tickets.find((t) => t.status === 'error');
  if (errored) {
    console.error('Push errored:', errored.message, errored.details ?? '');
    process.exit(1);
  }
  console.log('Push accepted by Expo. Check the device.');
};

run().catch((e) => { console.error(e); process.exit(1); });
