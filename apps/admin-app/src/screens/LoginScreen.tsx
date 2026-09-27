import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAppDispatch, useAppSelector } from '../store';
import { loginAdmin } from '../store/authSlice';
import { adminTheme } from '../theme';

export const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.adminAuth.status);
  const authError = useAppSelector((state) => state.adminAuth.error);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email/phone and password.');
      return;
    }
    try {
      await dispatch(loginAdmin({ identifier: identifier.trim(), password })).unwrap();
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <LinearGradient colors={['#1E8E3E', '#0D5E25']} style={styles.hero}>
        <Text style={styles.title}>Bam Bam Management</Text>
        <Text style={styles.subtitle}>Super admin and staff operations for the Pure Veg bakery and fast food business.</Text>
      </LinearGradient>
      <View style={styles.card}>
        <TextInput value={identifier} onChangeText={setIdentifier} style={styles.input} placeholder="Email or phone" autoCapitalize="none" />
        <View style={styles.passwordRow}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
          />
          <Text onPress={() => setShowPassword((value) => !value)} style={styles.passwordToggle}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </View>
        <PrimaryButton label={status === 'loading' ? 'Logging in...' : 'Secure Login'} onPress={handleLogin} />
        {status === 'error' && authError ? (
          <Text style={styles.errorText}>{authError}</Text>
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    minHeight: 240,
    borderRadius: adminTheme.radius.lg,
    padding: adminTheme.spacing.xl,
    justifyContent: 'flex-end',
    gap: 10
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900'
  },
  subtitle: {
    color: '#F4FCEF',
    lineHeight: 22
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: adminTheme.radius.lg,
    padding: adminTheme.spacing.lg,
    gap: 14
  },
  input: {
    borderWidth: 1,
    borderColor: adminTheme.colors.border,
    borderRadius: adminTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff'
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: adminTheme.colors.border,
    borderRadius: adminTheme.radius.md,
    backgroundColor: '#fff'
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  passwordToggle: {
    paddingHorizontal: 16,
    color: adminTheme.colors.primary,
    fontWeight: '800'
  },
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    textAlign: 'center'
  }
});
