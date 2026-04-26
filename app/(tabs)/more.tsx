import { Colors, Radius } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MoreScreen() {
  const router = useRouter();
  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroSub}>Manage & explore</Text>
            <Text style={styles.heroTitle}>
              More <Text style={{ color: Colors.accent }}>Options</Text>
            </Text>
          </View>

          <View style={styles.cardsSection}>
            {[
              {
                icon: "📊",
                title: "Brew Stats",
                sub: "Your brewing history at a glance",
                route: "/more/stats",
              },
              {
                icon: "📝",
                title: "Your Recipes",
                sub: "View and manage created recipes",
                route: "/more/your-recipes",
              },
            ].map((c) => (
              <TouchableOpacity
                key={c.title}
                style={styles.featureCard}
                onPress={() => router.push(c.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.featureIcon}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{c.title}</Text>
                  <Text style={styles.featureSub}>{c.sub}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Settings</Text>
          </View>

          {[
            {
              icon: "💾",
              title: "Backup & Restore",
              sub: "Export and import your data",
              route: "/more/backup",
            },
            {
              icon: "ℹ️",
              title: "About Ticku",
              sub: "Open source coffee timer app",
              route: "/more/about",
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.settingsItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.settingsLeft}>
                <View style={styles.settingsIcon}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.settingsTitle}>{item.title}</Text>
                  <Text style={styles.settingsSub}>{item.sub}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ticku v1.0.0</Text>
            <Text style={styles.footerText}>
              No account needed · Your data stays local
            </Text>
            <Text style={styles.footerText}>Open Source 🫘</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: Colors.bg3,
  },
  heroSub: { fontSize: 13, color: Colors.text3, marginBottom: 4 },
  heroTitle: { fontSize: 26, color: Colors.text, fontWeight: "400" },
  cardsSection: { margin: 16, gap: 12 },
  featureCard: {
    backgroundColor: Colors.bg2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: { fontSize: 28 },
  featureTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
    marginBottom: 2,
  },
  featureSub: { fontSize: 12, color: Colors.text3 },
  chevron: { fontSize: 20, color: Colors.text3 },
  sectionLabel: { paddingHorizontal: 20, paddingBottom: 8 },
  sectionLabelText: {
    fontSize: 12,
    color: Colors.text3,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsTitle: { fontSize: 14, color: Colors.text },
  settingsSub: { fontSize: 12, color: Colors.text3, marginTop: 1 },
  footer: { alignItems: "center", paddingVertical: 24, gap: 4 },
  footerText: { fontSize: 11, color: Colors.text3 },
});
