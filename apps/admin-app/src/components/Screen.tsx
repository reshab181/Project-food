import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminTheme } from '../theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export const Screen = ({ children, scroll = true, contentStyle }: ScreenProps) => {
  // Read the real device insets (status bar height on top, gesture/nav bar at
  // the bottom) and apply them as padding so content is never cut off.
  const insets = useSafeAreaInsets();

  const basePadding = {
    paddingTop: insets.top + adminTheme.spacing.md,
    paddingBottom: insets.bottom + adminTheme.spacing.md,
    paddingLeft: insets.left + adminTheme.spacing.md,
    paddingRight: insets.right + adminTheme.spacing.md
  };

  if (scroll) {
    return (
      <View style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.content, basePadding, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.safe, basePadding, contentStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: adminTheme.colors.background
  },
  content: {
    gap: adminTheme.spacing.md
  }
});
