import { brand } from '@bambam/shared';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { palette, type as t } from '../theme';

const POINTS = [
  'Fresh cakes, pizza, and burgers from a pure veg kitchen.',
  'Live order tracking with instant updates from the shop.',
  'Full ingredient transparency with every item.',
];

export const OnboardingScreen = ({ onDone }: { onDone: () => void }) => (
  <Screen>
    {/* ── Wordmark block ── */}
    <View style={styles.hero}>
      <Text style={styles.appName}>{brand.appName}</Text>
      <Text style={styles.tagline}>{brand.tagline}</Text>
    </View>

    <View style={styles.divider} />

    {/* ── Value props ── */}
    <View style={styles.points}>
      {POINTS.map((line) => (
        <View key={line} style={styles.pointRow}>
          <Text style={styles.bullet}>—</Text>
          <Text style={styles.pointText}>{line}</Text>
        </View>
      ))}
    </View>

    <View style={styles.divider} />

    <PrimaryButton label="Start ordering" onPress={onDone} />

    <Text style={styles.fine}>{brand.trustMessage}</Text>
  </Screen>
);

const styles = StyleSheet.create({
  hero: {
    paddingTop: 24,
    gap: 8,
  },
  appName: {
    ...t.display,
    color: palette.text,
    letterSpacing: 1.2,
  },
  tagline: {
    ...t.body,
    color: palette.textSoft,
  },
  divider: {
    height: 1,
    backgroundColor: palette.hairline,
  },
  points: {
    gap: 16,
  },
  pointRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    ...t.body,
    color: palette.accent,
    marginTop: 1,
  },
  pointText: {
    ...t.body,
    color: palette.textSoft,
    flex: 1,
  },
  fine: {
    ...t.caption,
    color: palette.textFaint,
    textAlign: 'center',
  },
});
