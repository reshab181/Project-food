import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { adminTheme } from '../theme';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export const SectionCard = ({ title, subtitle, children }: SectionCardProps) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    <View style={styles.children}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: adminTheme.radius.lg,
    padding: adminTheme.spacing.lg,
    gap: 10
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  subtitle: {
    color: adminTheme.colors.textMuted
  },
  children: {
    gap: 10
  }
});
