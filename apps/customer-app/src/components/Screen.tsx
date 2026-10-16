import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customerTheme } from '../theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export const Screen = ({ children, scroll = true, contentStyle }: ScreenProps) => {
  // Read the real device insets (status bar height on top, gesture/nav bar at
  // the bottom) and apply them as padding so content is never cut off.
  const insets = useSafeAreaInsets();

  const basePadding = {
    paddingTop: insets.top + customerTheme.spacing.md,
    paddingBottom: insets.bottom + customerTheme.spacing.md,
    paddingLeft: insets.left + customerTheme.spacing.md,
    paddingRight: insets.right + customerTheme.spacing.md
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
    backgroundColor: customerTheme.colors.background
  },
  content: {
    gap: customerTheme.spacing.md
  }
});
