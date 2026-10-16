import { Pressable, StyleSheet, Text } from 'react-native';
import { adminTheme } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
}

export const PrimaryButton = ({ label, onPress, variant = 'solid' }: PrimaryButtonProps) => (
  <Pressable onPress={onPress} style={[styles.button, variant === 'solid' ? styles.solid : styles.outline]}>
    <Text style={[styles.label, variant === 'solid' ? styles.solidLabel : styles.outlineLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: adminTheme.radius.md
  },
  solid: {
    backgroundColor: adminTheme.colors.primary
  },
  outline: {
    borderWidth: 1,
    borderColor: adminTheme.colors.primary,
    backgroundColor: '#fff'
  },
  label: {
    fontWeight: '800'
  },
  solidLabel: {
    color: '#fff'
  },
  outlineLabel: {
    color: adminTheme.colors.primary
  }
});
