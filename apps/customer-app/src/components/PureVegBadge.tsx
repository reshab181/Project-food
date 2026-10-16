import { brand } from '@bambam/shared';
import { StyleSheet, Text, View } from 'react-native';
import { customerTheme } from '../theme';

export const PureVegBadge = () => (
  <View style={styles.wrapper}>
    <View style={styles.dot} />
    <Text style={styles.label}>{brand.pureVegBadgeText}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: customerTheme.radius.pill,
    backgroundColor: '#E9F7EE'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: customerTheme.colors.pureVeg,
    borderWidth: 1,
    borderColor: '#0F6B30'
  },
  label: {
    color: customerTheme.colors.primaryDark,
    fontWeight: '700'
  }
});
