import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

type Option = string | { value: string; label: string };

interface Props {
  label?: string;
  value: string;
  options: Option[];
  onChange: (val: string) => void;
  style?: object;
}

export const Select = ({ label, value, options, onChange, style }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selected
    ? typeof selected === 'string' ? selected : selected.label
    : 'Select…';

  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.triggerText}>{displayLabel}</Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={styles.dropdown}>
            <ScrollView>
              {options.map((opt, i) => {
                const v = typeof opt === 'string' ? opt : opt.value;
                const l = typeof opt === 'string' ? opt : opt.label;
                const isSelected = v === value;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => { onChange(v); setOpen(false); }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 11, color: Colors.text3, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  trigger: {
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  triggerText: { color: Colors.text, fontSize: 14, flex: 1 },
  arrow: { color: Colors.text3, fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  dropdown: {
    backgroundColor: Colors.bg2, borderWidth: 0.5, borderColor: Colors.border2,
    borderRadius: Radius.md, width: '100%', maxHeight: 320, overflow: 'hidden',
  },
  option: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  optionSelected: { backgroundColor: 'rgba(200,146,42,0.12)' },
  optionText: { color: Colors.text, fontSize: 14 },
  optionTextSelected: { color: Colors.accent, fontWeight: '500' },
});
