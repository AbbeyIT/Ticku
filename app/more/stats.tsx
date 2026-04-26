import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function BrewStatsScreen() {
  const { data, getAllRecipes } = useApp();
  const router = useRouter();

  const stats = useMemo(() => {
    if (!data) return null;
    const allRecipes = getAllRecipes();
    const totalWater = data.brewLog.reduce((sum, l) => {
      const r = allRecipes.find((x) => x.id === l.recipeId);
      return sum + (r?.water || 0);
    }, 0);
    const origins = [...new Set(data.beans.map((b) => b.origin))];
    const roasters = [...new Set(data.beans.map((b) => b.roaster).filter(Boolean))];
    const freq: Record<string, number> = {};
    data.brewLog.forEach((l) => { freq[l.recipeId] = (freq[l.recipeId] || 0) + 1; });
    const topId = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topRecipe = allRecipes.find((x) => x.id === topId);
    const recentLog = [...data.brewLog].reverse().slice(0, 5).map((l) => ({
      ...l, recipe: allRecipes.find((r) => r.id === l.recipeId),
    }));
    return { totalBrews: data.brewLog.length, totalWater, totalBeans: data.beans.reduce((s, b) => s + (b.amountLeft||0), 0), origins, roasters, topRecipe, recentLog };
  }, [data]);

  if (!stats) return null;

  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Brew Stats</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {[
            { value: stats.totalBrews, label: 'Total Brews', icon: '☕' },
            { value: `${stats.totalWater}ml`, label: 'Water Used', icon: '💧' },
            { value: `${stats.totalBeans}g`, label: 'Beans on Hand', icon: '🫘' },
            { value: stats.origins.length, label: 'Origins Explored', icon: '🌍' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Brewed</Text>
          <View style={styles.topCard}>
            <Text style={{ fontSize: 24 }}>🏆</Text>
            <View>
              <Text style={styles.topName}>{stats.topRecipe?.name || '—'}</Text>
              {stats.topRecipe && <Text style={styles.topMethod}>{stats.topRecipe.method}</Text>}
            </View>
          </View>
        </View>

        {stats.origins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Origins in Collection</Text>
            <View style={styles.tagRow}>
              {stats.origins.map((o) => (
                <View key={o} style={styles.tag}><Text style={styles.tagText}>{o}</Text></View>
              ))}
            </View>
          </View>
        )}

        {stats.roasters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Roasters Discovered</Text>
            <View style={styles.tagRow}>
              {stats.roasters.map((r) => (
                <View key={r} style={styles.tagAccent}><Text style={styles.tagAccentText}>{r}</Text></View>
              ))}
            </View>
          </View>
        )}

        {stats.recentLog.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Brews</Text>
            {stats.recentLog.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={{ fontSize: 18 }}>☕</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logName}>{log.recipe?.name || 'Unknown Recipe'}</Text>
                  <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString()}</Text>
                </View>
                {log.recipe && (
                  <View style={styles.logBadge}><Text style={styles.logBadgeText}>{log.recipe.method}</Text></View>
                )}
              </View>
            ))}
          </View>
        )}

        {stats.totalBrews === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
            <Text style={styles.emptyTitle}>No brews yet</Text>
            <Text style={styles.emptySub}>Start a recipe to see your stats here</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 16, gap: 10 },
  statCard: { width: '46%', flexGrow: 1, backgroundColor: Colors.bg2, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, alignItems: 'flex-start' },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 28, color: Colors.accent, fontWeight: '600', marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.4 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 11, color: Colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  topCard: { backgroundColor: Colors.bg2, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  topName: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  topMethod: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: Colors.surface, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 11, color: Colors.text2, fontWeight: '500' },
  tagAccent: { backgroundColor: 'rgba(200,146,42,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  tagAccentText: { fontSize: 11, color: Colors.accent2, fontWeight: '500' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  logName: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  logDate: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  logBadge: { backgroundColor: Colors.surface, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 },
  logBadgeText: { fontSize: 10, color: Colors.text2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, color: Colors.text, fontWeight: '500', marginBottom: 8 },
  emptySub: { fontSize: 13, color: Colors.text3 },
});