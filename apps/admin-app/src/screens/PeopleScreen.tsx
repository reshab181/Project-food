import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useAppDispatch, useAppSelector } from '../store';
import { createStaffMember, fetchCustomers, fetchStaff } from '../store/opsSlice';
import { adminTheme } from '../theme';

export const PeopleScreen = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.adminAuth.user?.role);
  const staff = useAppSelector((state) => state.ops.staff);
  const customers = useAppSelector((state) => state.ops.customers);
  const [form, setForm] = useState({
    fullName: 'Counter Staff',
    email: 'staff@bambamcakeshop.com',
    phone: '+919111111111',
    password: 'Staff@123'
  });

  useEffect(() => {
    void dispatch(fetchStaff());
    void dispatch(fetchCustomers());
  }, [dispatch]);

  const handleCreateStaff = async () => {
    if (role !== 'super_admin') {
      Alert.alert('Restricted', 'Only the super admin can add or manage staff.');
      return;
    }

    try {
      await dispatch(createStaffMember(form)).unwrap();
      Alert.alert('Staff created', 'Permissions can now be managed from the backend.');
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <SectionCard title="Staff management" subtitle="All staff can view orders, but only the super admin manages permissions.">
        <TextInput value={form.fullName} onChangeText={(fullName) => setForm((prev) => ({ ...prev, fullName }))} style={styles.input} placeholder="Full name" />
        <TextInput value={form.email} onChangeText={(email) => setForm((prev) => ({ ...prev, email }))} style={styles.input} placeholder="Email" autoCapitalize="none" />
        <TextInput value={form.phone} onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))} style={styles.input} placeholder="Phone" />
        <TextInput value={form.password} onChangeText={(password) => setForm((prev) => ({ ...prev, password }))} style={styles.input} placeholder="Password" secureTextEntry />
        <PrimaryButton label={role === 'super_admin' ? 'Add staff member' : 'Super admin only'} onPress={handleCreateStaff} />
        {staff.map((member) => (
          <View key={member._id} style={styles.rowCard}>
            <Text style={styles.bold}>{member.fullName}</Text>
            <Text style={styles.meta}>{member.role}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Customers" subtitle="Order history and repeat customer visibility.">
        {customers.map((customer) => (
          <View key={customer._id} style={styles.rowCard}>
            <Text style={styles.bold}>{customer.fullName}</Text>
            <Text style={styles.meta}>{customer.phone}</Text>
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: adminTheme.colors.border,
    borderRadius: adminTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff'
  },
  rowCard: {
    backgroundColor: adminTheme.colors.adminSurface,
    borderRadius: adminTheme.radius.md,
    padding: adminTheme.spacing.md,
    gap: 4
  },
  bold: {
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  meta: {
    color: adminTheme.colors.textMuted
  }
});
