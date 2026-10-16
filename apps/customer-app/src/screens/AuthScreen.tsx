import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { authApi } from '../api/services';
import { useAppDispatch, useAppSelector } from '../store';
import { loginCustomer, loginWithGoogle, signupCustomer, verifyOtp } from '../store/authSlice';
import { customerTheme } from '../theme';

type Mode = 'otp' | 'login' | 'signup';

export const AuthScreen = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const loading = status === 'loading';

  const [mode, setMode] = useState<Mode>('otp');

  // Email/password form (login + signup).
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone/OTP form.
  const [phone, setPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setOtpStep('phone');
    setOtp('');
    setOtpInfo(null);
  };

  const handleEmailAuth = async () => {
    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          Alert.alert('Missing details', 'Please enter your email and password.');
          return;
        }
        await dispatch(loginCustomer({ identifier: email.trim(), password })).unwrap();
      } else {
        if (!fullName.trim() || !email.trim() || !phone.trim() || password.length < 6) {
          Alert.alert('Check your details', 'Name, email, phone and a 6+ char password are required.');
          return;
        }
        await dispatch(signupCustomer({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password })).unwrap();
        // Account created. Do NOT auto-login - send the user to the login
        // screen to sign in with their new credentials.
        const registeredEmail = email.trim();
        setPassword('');
        setFullName('');
        switchMode('login');
        setEmail(registeredEmail);
        Alert.alert('Account created', 'Your account is ready. Please log in to continue.');
        return;
      }
    } catch (error) {
      Alert.alert('Authentication failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleSendOtp = async () => {
    if (!/^\+?\d{10,15}$/.test(phone.replace(/\s|-/g, ''))) {
      Alert.alert('Invalid phone', 'Please enter a valid phone number (with country code).');
      return;
    }
    setSendingOtp(true);
    setOtpInfo(null);
    try {
      const res = await authApi.requestOtp(phone.trim(), otpName.trim() || undefined);
      setOtpStep('code');
      if (res.data.channel === 'sms') {
        setOtpInfo('We sent a 6-digit code to your phone.');
      } else {
        // Dev fallback (no SMS provider configured): show the code so it can be tested.
        setOtpInfo(res.data.devCode ? `Dev mode: your code is ${res.data.devCode}` : 'Dev mode: check the server logs for the code.');
        if (res.data.devCode) setOtp(res.data.devCode);
      }
    } catch (error) {
      Alert.alert('Could not send OTP', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Enter OTP', 'Please enter the code sent to your phone.');
      return;
    }
    try {
      await dispatch(verifyOtp({ phone: phone.trim(), code: otp.trim() })).unwrap();
    } catch (error) {
      Alert.alert('Verification failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Pure Veg ordering made premium</Text>
        <Text style={styles.subtitle}>Login with your phone (OTP), email, or create a new account.</Text>
      </View>

      <View style={styles.switchRow}>
        {(['otp', 'login', 'signup'] as const).map((item) => (
          <Text key={item} onPress={() => switchMode(item)} style={[styles.switch, mode === item && styles.switchActive]}>
            {item === 'otp' ? 'PHONE' : item.toUpperCase()}
          </Text>
        ))}
      </View>

      {mode === 'otp' ? (
        <View style={styles.form}>
          {otpStep === 'phone' ? (
            <>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                autoCapitalize="none"
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>Name (optional, for new accounts)</Text>
              <TextInput value={otpName} onChangeText={setOtpName} placeholder="Your name" style={styles.input} />
              <PrimaryButton label="Send OTP" onPress={handleSendOtp} loading={sendingOtp} />
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Enter the OTP sent to {phone}</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit code"
                keyboardType="number-pad"
                maxLength={8}
                style={[styles.input, styles.otpInput]}
              />
              {otpInfo ? <Text style={styles.otpInfo}>{otpInfo}</Text> : null}
              <PrimaryButton label="Verify & continue" onPress={handleVerifyOtp} loading={loading} />
              <Text
                onPress={() => {
                  setOtpStep('phone');
                  setOtp('');
                  setOtpInfo(null);
                }}
                style={styles.linkText}
              >
                Change number / resend
              </Text>
            </>
          )}
        </View>
      ) : (
        <View style={styles.form}>
          {mode === 'signup' ? (
            <>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput value={fullName} onChangeText={setFullName} placeholder="Your name" style={styles.input} />
            </>
          ) : null}
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
          {mode === 'signup' ? (
            <>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" style={styles.input} />
            </>
          ) : null}
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} />
          <PrimaryButton label={mode === 'signup' ? 'Create account' : 'Login'} onPress={handleEmailAuth} loading={loading} />
        </View>
      )}

      <View style={styles.divider}>
        <Text style={styles.dividerText}>or</Text>
      </View>

      <PrimaryButton
        label="Continue with Google"
        variant="outline"
        onPress={async () => {
          try {
            await dispatch(
              loginWithGoogle({ email: 'google.customer@bambamcakeshop.com', fullName: 'Google Customer', googleId: 'demo-google-id' })
            ).unwrap();
          } catch (error) {
            Alert.alert('Google login failed', error instanceof Error ? error.message : 'Please try again.');
          }
        }}
      />

      {loading ? <ActivityIndicator style={{ marginTop: 16 }} color={customerTheme.colors.primary} /> : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    paddingTop: customerTheme.spacing.xl,
    gap: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: customerTheme.colors.text
  },
  subtitle: {
    color: customerTheme.colors.textMuted,
    lineHeight: 22
  },
  switchRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18
  },
  switch: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: customerTheme.radius.pill,
    backgroundColor: customerTheme.colors.mutedSurface,
    color: customerTheme.colors.textMuted,
    fontWeight: '700'
  },
  switchActive: {
    backgroundColor: '#E9F7EE',
    color: customerTheme.colors.primary
  },
  form: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.lg,
    gap: 10,
    marginTop: 16
  },
  fieldLabel: {
    fontWeight: '700',
    color: customerTheme.colors.text,
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: customerTheme.colors.border,
    borderRadius: customerTheme.radius.md,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  otpInput: {
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '800'
  },
  otpInfo: {
    color: customerTheme.colors.primary,
    fontWeight: '600'
  },
  linkText: {
    textAlign: 'center',
    color: customerTheme.colors.primary,
    fontWeight: '700',
    paddingVertical: 8
  },
  divider: {
    alignItems: 'center',
    marginVertical: 16
  },
  dividerText: {
    color: customerTheme.colors.textMuted,
    fontWeight: '600'
  }
});
