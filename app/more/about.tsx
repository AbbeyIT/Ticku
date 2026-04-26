import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>About Ticku</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <Text style={{ fontSize: 64, marginBottom: 8 }}>☕</Text>
          <Text style={styles.appName}>Ticku</Text>
          <Text style={styles.version}>v1.0.0</Text>
          <Text style={styles.tagline}>brew with precision</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.body}>Ticku is an open source coffee brewing timer and recipe manager. No accounts, no cloud — your data lives on your device.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {[
            '☕ Step-by-step brew timer with visual ring',
            '📖 Curated recipes (V60, AeroPress, Switch, Origami)',
            '✏️ Create & save custom recipes',
            '🫘 Coffee bean collection tracker',
            '📊 Brew stats and history',
            '💾 Local backup & restore',
            '📱 Works offline, no account needed',
          ].map((f, i) => <Text key={i} style={styles.featureItem}>{f}</Text>)}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Open Source</Text>
          <Text style={styles.body}>Ticku is open source. Contributions, bug reports, and feature requests are welcome on GitHub.</Text>
          <TouchableOpacity style={styles.githubBtn} onPress={() => Linking.openURL('https://github.com')}>
            <Text style={styles.githubBtnText}>View on GitHub →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ☕ by the community</Text>
          <Text style={styles.footerText}>Your data stays on your device</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.border, gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: Colors.text2 },
  headerTitle: { fontSize: 18, color: Colors.text, fontWeight: '500' },
  logoSection: { alignItems: 'center', paddingVertical: 32 },
  appName: { fontSize: 36, fontWeight: '900', color: Colors.accent2, letterSpacing: -1 },
  version: { fontSize: 12, color: Colors.text3, marginTop: 4 },
  tagline: { fontSize: 14, color: Colors.text3, marginTop: 4 },
  section: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 11, color: Colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  body: { fontSize: 14, color: Colors.text2, lineHeight: 22 },
  featureItem: { fontSize: 13, color: Colors.text2, lineHeight: 26 },
  githubBtn: { marginTop: 12, backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border2, borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center' },
  githubBtnText: { fontSize: 14, color: Colors.accent, fontWeight: '500' },
  footer: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  footerText: { fontSize: 11, color: Colors.text3 },
});