import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { palette, customerTheme } from '../theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export const Screen = ({ children, scroll = true, contentStyle }: ScreenProps) => {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return <SafeAreaView style={styles.safe}>{inner}</SafeAreaView>;
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    paddingHorizontal: customerTheme.spacing.md,
    paddingTop: customerTheme.spacing.lg,
    paddingBottom: customerTheme.spacing.xxl,
    gap: customerTheme.spacing.lg,
  },
});
