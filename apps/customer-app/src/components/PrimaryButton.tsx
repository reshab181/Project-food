import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { palette, type as t } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton = ({
  label,
  onPress,
  variant = 'solid',
  loading,
  disabled,
}: PrimaryButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={loading || disabled}
    style={({ pressed }) => [
      styles.base,
      variant === 'solid'   && styles.solid,
      variant === 'outline' && styles.outline,
      variant === 'ghost'   && styles.ghost,
      (pressed || disabled) && styles.dimmed,
    ]}
    accessibilityRole="button"
  >
    {loading ? (
      <ActivityIndicator
        size="small"
        color={variant === 'solid' ? palette.white : palette.accent}
      />
    ) : (
      <Text
        style={[
          styles.label,
          variant === 'solid'   && styles.solidLabel,
          variant === 'outline' && styles.outlineLabel,
          variant === 'ghost'   && styles.ghostLabel,
        ]}
      >
        {label}
      </Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  solid: {
    backgroundColor: palette.accent,
  },
  outline: {
    borderWidth: 1,
    borderColor: palette.accent,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dimmed: { opacity: 0.55 },
  label: {
    ...t.label,
  },
  solidLabel: { color: palette.white },
  outlineLabel: { color: palette.accent },
  ghostLabel: { color: palette.textSoft },
});
