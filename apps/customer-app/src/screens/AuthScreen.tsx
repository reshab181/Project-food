import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { loginCustomer, signupCustomer } from '../store/authSlice';
import { palette, type as t } from '../theme';

type Mode = 'login' | 'signup';

const MODE_LABELS: Record<Mode, string> = {
  login:  'Sign in',
  signup: 'Create account',
};

export const AuthScreen = () => {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const status = useAppSelector((s) => s.auth.status);
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const loading = status === 'loading';

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      if (mode === 'login') {
        await dispatch(loginCustomer({ identifier: form.email, password: form.password })).unwrap();
        success('Welcome back.');
      } else if (mode === 'signup') {
        await dispatch(signupCustomer(form)).unwrap();
        success('Account created — welcome!');
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Bam Bam Cake Shop</Text>
        <Text style={styles.sub}>Sign in to start ordering.</Text>
      </View>

      <View style={styles.divider} />

      {/* Mode switcher — plain text tabs */}
      <View style={styles.modeRow}>
        {(['login', 'signup'] as Mode[]).map((m) => (
          <Text
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeTab, mode === m && styles.modeTabActive]}
          >
            {MODE_LABELS[m]}
          </Text>
        ))}
      </View>

{/* Fields */}
<View style={styles.fields}>
  {mode !== 'login' && (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Full name</Text>
      <TextInput
        value={form.fullName}
        onChangeText={set('fullName')}
        style={styles.input}
      />
      <View style={styles.fieldLine} />
    </View>
  )}

  <View style={styles.field}>
    <Text style={styles.fieldLabel}>Email</Text>
    <TextInput
      value={form.email}
      onChangeText={set('email')}
      style={styles.input}
      autoCapitalize="none"
      keyboardType="email-address"
    />
    <View style={styles.fieldLine} />
  </View>

  {mode !== 'login' && (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Phone</Text>
      <TextInput
        value={form.phone}
        onChangeText={set('phone')}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <View style={styles.fieldLine} />
    </View>
  )}

  <View style={styles.field}>
    <Text style={styles.fieldLabel}>Password</Text>
    <TextInput
      value={form.password}
      onChangeText={set('password')}
      style={styles.input}
      secureTextEntry
    />
    <View style={styles.fieldLine} />
  </View>
</View>

      <PrimaryButton label={MODE_LABELS[mode]} onPress={handleSubmit} loading={loading} />
      <PrimaryButton
        label="Continue with Google"
        variant="outline"
        onPress={() => error('Google login is not yet available.')}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: 8 },
  title: {
    ...t.display,
    color: palette.text,
    letterSpacing: 1.0,
  },
  sub: {
    ...t.body,
    color: palette.textSoft,
  },
  divider: {
    height: 1,
    backgroundColor: palette.hairline,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 24,
  },
  modeTab: {
    ...t.body,
    color: palette.textFaint,
    paddingBottom: 4,
  },
  modeTabActive: {
    color: palette.text,
    borderBottomWidth: 1,
    borderBottomColor: palette.text,
  },
  fields: { gap: 20 },
  field: { gap: 4 },
  fieldLabel: {
    ...t.caption,
    color: palette.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    ...t.input,
    color: palette.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  fieldLine: {
    height: 1,
    backgroundColor: palette.border,
  },
});
