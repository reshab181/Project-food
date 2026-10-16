import { Expo } from 'expo-server-sdk';

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('Pass one or more push ticket ids');
  process.exit(1);
}
const expo = new Expo();
const r = await expo.getPushNotificationReceiptsAsync(ids);
console.log(JSON.stringify(r, null, 2));
