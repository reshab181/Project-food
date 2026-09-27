// Section label — overline-style uppercase small text, no big bold heading.
import { StyleSheet, Text, View } from 'react-native';
import { palette, type as t } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title.toUpperCase()}</Text>
    {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 3 },
  title: {
    ...t.overline,
    color: palette.textFaint,
  },
  sub: {
    ...t.caption,
    color: palette.textSoft,
  },
});
