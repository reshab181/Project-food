import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { customerTheme } from '../theme';

interface InfoBannerProps {
  title: string;
  message: string;
}

export const InfoBanner = ({ title, message }: InfoBannerProps) => (
  <LinearGradient colors={['#1E8E3E', '#56AB2F']} style={styles.banner}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Pure Veg Promise</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  banner: {
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.lg,
    gap: 10
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900'
  },
  message: {
    color: '#F4FCEF',
    lineHeight: 22
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: customerTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700'
  }
});
