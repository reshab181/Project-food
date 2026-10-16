import { StyleSheet, Text, View } from 'react-native';
import { adminTheme } from '../theme';

export const MetricTile = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.tile}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 110,
    borderRadius: adminTheme.radius.md,
    backgroundColor: adminTheme.colors.adminSurface,
    padding: adminTheme.spacing.md,
    justifyContent: 'space-between'
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    color: adminTheme.colors.primaryDark
  },
  label: {
    color: adminTheme.colors.textMuted,
    fontWeight: '700'
  }
});
