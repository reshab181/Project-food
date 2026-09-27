// Quiet info strip — no gradient, no bold text, light tinted background.
import { StyleSheet, Text, View } from 'react-native';
import { palette, type as t } from '../theme';

interface InfoBannerProps {
  title: string;
  message: string;
}

export const InfoBanner = ({ title, message }: InfoBannerProps) => (
  <View style={styles.wrap}>
    <Text style={styles.icon}>🌿</Text>
    <View style={styles.copy}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: palette.accentLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,124,89,0.15)',
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 1,
  },
  copy: { flex: 1, gap: 3 },
  title: {
    ...t.label,
    color: palette.accent,
  },
  message: {
    ...t.caption,
    color: palette.textSoft,
  },
});
