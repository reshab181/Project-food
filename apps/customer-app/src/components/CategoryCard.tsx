import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { customerTheme } from '../theme';

interface CategoryCardProps {
  label: string;
  onPress: () => void;
}

export const CategoryCard = ({ label, onPress }: CategoryCardProps) => (
  <Pressable onPress={onPress} style={styles.wrapper}>
    <LinearGradient colors={['#FFF5DE', '#FBE7C0']} style={styles.gradient}>
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  </Pressable>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  gradient: {
    minHeight: 96,
    borderRadius: customerTheme.radius.md,
    justifyContent: 'center',
    padding: customerTheme.spacing.md
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: customerTheme.colors.primaryDark
  }
});
