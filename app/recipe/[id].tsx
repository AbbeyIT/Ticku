import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Button, Divider } from '@/components/UI';
import { useToast } from '@/components/Toast';

const STEP_ICONS: Record<string, string> = { step: '☕', water: '💧', pause: '⏸' };
const STEP_COLORS: Record<string, string> = { step: Colors.text2, water: '#7ab8d9', pause: Colors.text3 };

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, getAllRecipes, toggleFavorite, deleteRecipe } = useApp();
  const router = useRouter();
  const showToast = useToast();

  const recipe = useMemo(() => getAllRecipes().find((r) => r.id === id), [id, data]);
  if (!recipe) return null;

  const isFav = data?.favorites?.includes(recipe.id);
  const isCustom = recipe.custom === true;

  const handleFav = async () => {
    await toggleFavorite(recipe.id);
    showToast(isFav ? 'Removed from favorites' : '❤️ Added to favorites');
  };

  const handleDelete = () => {
    Alert.alert('Delete Recipe', `Delete "${recipe.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteRecipe(recipe.id);
        showToast('Recipe deleted');
        router.back();
      }},
    ]);
  };

  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        <TouchableOpacity onPress={handleFav} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22 }}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        {isCustom && (
          <TouchableOpacity onPress={() => router.push(`/recipe/create?editId=${recipe.id}` as any)}
            style={styles.editBtn}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.methodBadge}><Text style={styles.methodText}>{recipe.method}</Text></View>
          {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Beans', value: `${recipe.beans}g`, icon: '🫘' },
            { label: 'Water', value: `${recipe.water}ml`, icon: '💧' },
            { label: 'Temp', value: `${recipe.temp}°C`, icon: '🌡️' },
            { label: 'Brew Time', value: recipe.brewTime, icon: '⏱️' },
            { label: 'Grind Size', value: recipe.grind, icon: '⚙️' },
            { label: 'Ratio', value: `1:${Math.round(recipe.water / recipe.beans)}`, icon: '⚖️' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {recipe.steps?.length > 0 && (
          <View style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>Brew Steps</Text>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepDot, { backgroundColor: STEP_COLORS[step.type] }]} />
                  {i < recipe.steps.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text style={[styles.stepDesc, { color: STEP_COLORS[step.type] }]}>
                      {STEP_ICONS[step.type]} {step.desc}
                      {step.ml ? <Text style={{ color: '#7ab8d9', fontSize: 11 }}> ({step.ml}ml)</Text> : null}
                    </Text>
                    <Text style={styles.stepDur}>{step.dur}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <Divider />
        <View style={styles.actions}>
          <Button title="▶  Start Brewing Timer" onPress={() => router.push(`/timer/${recipe.id}` as any)} style={{ flex: 1 }} />
        </View>
        {isCustom && (
          <TouchableOpacity style={styles.deleteRow} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Recipe</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.border, gap: 10 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: Colors.text2 },
  headerTitle: { flex: 1, fontSize: 17, color: Colors.text, fontWeight: '500' },
  editBtn: { backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingVertical: 6, paddingHorizontal: 12 },
  editText: { fontSize: 13, color: Colors.accent },
  hero: { padding: 20, backgroundColor: Colors.bg3 },
  methodBadge: { backgroundColor: 'rgba(200,146,42,0.15)', alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 10 },
  methodText: { fontSize: 12, color: Colors.accent2, fontWeight: '500' },
  description: { fontSize: 13, color: Colors.text3, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 16, gap: 8 },
  statCard: { width: '30%', flexGrow: 1, backgroundColor: Colors.bg2, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.sm, padding: 12, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 15, color: Colors.accent, fontWeight: '600', marginBottom: 2 },
  statLabel: { fontSize: 10, color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  stepsSection: { padding: 20 },
  stepsTitle: { fontSize: 11, color: Colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { width: 32, alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  stepLine: { flex: 1, width: 2, backgroundColor: Colors.surface2, minHeight: 20, marginVertical: 2 },
  stepContent: { flex: 1, paddingLeft: 10, paddingBottom: 16 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepDesc: { fontSize: 14, fontWeight: '500', flex: 1 },
  stepDur: { fontSize: 12, color: Colors.accent, fontWeight: '500', marginLeft: 8 },
  actions: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 },
  deleteRow: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  deleteText: { fontSize: 13, color: Colors.red },
});