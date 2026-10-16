import { brand } from '@bambam/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { customerTheme } from '../theme';

export const OnboardingScreen = ({ onDone }: { onDone: () => void }) => (
  <Screen>
    <LinearGradient colors={['#1E8E3E', '#56AB2F']} style={styles.hero}>
      <Text style={styles.title}>{brand.appName}</Text>
      <Text style={styles.tagline}>{brand.tagline}</Text>
      <Text style={styles.copy}>{brand.trustMessage}</Text>
    </LinearGradient>
    <View style={styles.card}>
      <Text style={styles.heading}>What you can do</Text>
      <Text style={styles.item}>Fresh cakes, pizza, and burgers from a pure veg kitchen.</Text>
      <Text style={styles.item}>Live order tracking with instant updates from the shop.</Text>
      <Text style={styles.item}>Ingredients transparency, veg badge, and trusted delivery flow.</Text>
    </View>
    <PrimaryButton label="Start Ordering" onPress={onDone} />
  </Screen>
);

const styles = StyleSheet.create({
  hero: {
    minHeight: 260,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.xl,
    justifyContent: 'flex-end',
    gap: 10
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900'
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  copy: {
    color: '#F4FCEF',
    lineHeight: 22
  },
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.lg,
    gap: 12
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  item: {
    color: customerTheme.colors.textMuted,
    lineHeight: 22
  }
});
