import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

export const Button = ({
  title, onPress, variant = 'primary', style, disabled, loading,
}: {
  title: string; onPress?: () => void; variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle; disabled?: boolean; loading?: boolean;
}) => {
  const base = variant === 'outline' ? styles.btnOutline : variant === 'ghost' ? styles.btnGhost : styles.btnPrimary;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading}
      style={[base, style, (disabled || loading) && { opacity: 0.5 }]} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? Colors.bg : Colors.accent} />
        : <Text style={variant === 'primary' ? styles.btnTP : variant === 'outline' ? styles.btnTO : styles.btnTG}>{title}</Text>
      }
    </TouchableOpacity>
  );
};

export const FormInput = ({ label, ...props }: { label?: string; [key: string]: any }) => (
  <View style={{ marginBottom: 14 }}>
    {label && <Text style={styles.formLabel}>{label}</Text>}
    <TextInput style={styles.formInput} placeholderTextColor={Colors.text3} {...props} />
  </View>
);

export const EmptyState = ({
  icon, title, sub, action, onAction,
}: { icon: string; title: string; sub?: string; action?: string; onAction?: () => void }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {sub && <Text style={styles.emptySub}>{sub}</Text>}
    {action && <Button title={action} onPress={onAction} style={{ marginTop: 16 }} />}
  </View>
);

export const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <View style={styles.secHdr}>
    <Text style={styles.secTitle}>{title}</Text>
    {action && <TouchableOpacity onPress={onAction}><Text style={styles.secLink}>{action}</Text></TouchableOpacity>}
  </View>
);

export const Divider = ({ style }: { style?: ViewStyle }) => <View style={[styles.divider, style]} />;

const styles = StyleSheet.create({
  btnPrimary: { backgroundColor: Colors.accent, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  btnOutline: { borderWidth: 0.5, borderColor: Colors.border2, borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnGhost: { backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnTP: { color: Colors.bg, fontSize: 14, fontWeight: '600' },
  btnTO: { color: Colors.accent, fontSize: 13, fontWeight: '500' },
  btnTG: { color: Colors.text, fontSize: 13 },
  formLabel: { fontSize: 11, color: Colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 12, color: Colors.text, fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: Colors.text, fontWeight: '500', marginBottom: 8 },
  emptySub: { fontSize: 13, color: Colors.text3, textAlign: 'center', marginBottom: 20 },
  secHdr: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { fontSize: 16, color: Colors.text, fontWeight: '500' },
  secLink: { fontSize: 12, color: Colors.accent },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 12 },
});
