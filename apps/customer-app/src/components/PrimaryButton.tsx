import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { customerTheme } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  loading?: boolean;
}

export const PrimaryButton = ({ label, onPress, variant = 'solid', loading }: PrimaryButtonProps) => (
  <Pressable
    onPress={onPress}
    style={[styles.button, variant === 'outline' ? styles.outline : styles.solid]}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'outline' ? customerTheme.colors.primary : '#fff'} />
    ) : (
      <Text style={[styles.label, variant === 'outline' ? styles.outlineLabel : styles.solidLabel]}>{label}</Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: customerTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  solid: {
    backgroundColor: customerTheme.colors.primary
  },
  outline: {
    borderWidth: 1,
    borderColor: customerTheme.colors.primary,
    backgroundColor: customerTheme.colors.surface
  },
  label: {
    fontWeight: '700',
    fontSize: 16
  },
  solidLabel: {
    color: '#fff'
  },
  outlineLabel: {
    color: customerTheme.colors.primary
  }
});
