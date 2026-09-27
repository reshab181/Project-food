// Editorial category item — icon + label, no background box, separated by whitespace.
import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, type as t } from '../theme';

const ICONS: Record<string, string> = {
  Cakes:  '🎂',
  Pizza:  '🍕',
  Burger: '🍔',
};

interface CategoryCardProps {
  label: string;
  onPress: () => void;
}

export const CategoryCard = ({ label, onPress }: CategoryCardProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
    accessibilityRole="button"
  >
    <Text style={styles.icon}>{ICONS[label] ?? '🍽️'}</Text>
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  icon: {
    fontSize: 26,
    lineHeight: 32,
  },
  label: {
    ...t.caption,
    color: palette.textSoft,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
