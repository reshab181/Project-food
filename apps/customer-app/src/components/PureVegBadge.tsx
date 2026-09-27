// Subtle certification mark — thin-line leaf icon + small text, no pill fill.
import { StyleSheet, Text, View } from 'react-native';
import { palette, type as t } from '../theme';

// Minimal SVG-ish leaf drawn with Unicode + styling. Swap for an SVG icon
// library if you add one later.
export const PureVegBadge = () => (
  <View style={styles.row}>
    <Text style={styles.icon}>🌿</Text>
    <Text style={styles.label}>100% Pure Veg</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  icon: {
    fontSize: 11,
    lineHeight: 16,
  },
  label: {
    ...t.caption,
    color: palette.accent,
    letterSpacing: 0.4,
  },
});
