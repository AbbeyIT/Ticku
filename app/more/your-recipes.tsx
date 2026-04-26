import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { EmptyState } from '@/components/UI';
import { useToast } from '@/components/Toast';

export default function YourRecipesScreen() {
  const { data, getAllRecipes, deleteRecipe } = useApp();
  const router = useRouter();
  const showToast = useToast();

  const myRecipes = useMemo(() => getAllRecipes().filter((r) => r.custom), [data]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Recipe', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteRecipe(id);
        showToast('Recipe deleted');
      }},
    ]);
  };

  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Your Recipes</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/recipe/create' as any)}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {myRecipes.length === 0 ? (
          <EmptyState icon="📝" title="No custom recipes yet" sub="Create your first recipe to see it here"
            action="+ Create Recipe" onAction={() => router.push('/recipe/create' as any)} />
        ) : (
          myRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.card}>
              <TouchableOpacity style={styles.cardMain} onPress={() => router.push(`/recipe/${recipe.id}` as any)} activeOpacity={0.8}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName} numberOfLines={1}>{recipe.name}</Text>
                  <Text style={styles.cardMethod}>{recipe.method}</Text>
                  <View style={styles.cardMeta}>
                    {[
                      { icon: '🫘', val: `${recipe.beans}g` },
                      { icon: '💧', val: `${recipe.water}ml` },
                      { icon: '⏱️', val: recipe.brewTime },
                    ].map((m) => (
                      <View key={m.icon} style={styles.metaPill}>
                        <Text style={styles.metaText}>{m.icon} {m.val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/timer/${recipe.id}` as any)}>
                  <Text style={styles.actionBtnText}>▶ Brew</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/recipe/create?editId=${recipe.id}` as any)}>
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(recipe.id, recipe.name)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  headerTitle: { flex: 1, fontSize: 18, color: Colors.text, fontWeight: '500' },
  newBtn: { backgroundColor: Colors.accent, borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 14 },
  newBtnText: { color: Colors.bg, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: Colors.bg2, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden' },
  cardMain: { padding: 14 },
  cardName: { fontSize: 15, color: Colors.text, fontWeight: '600', marginBottom: 2 },
  cardMethod: { fontSize: 12, color: Colors.text3, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 6 },
  metaPill: { backgroundColor: Colors.surface, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  metaText: { fontSize: 11, color: Colors.text2 },
  cardActions: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: Colors.border },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRightWidth: 0.5, borderRightColor: Colors.border },
  actionBtnText: { fontSize: 12, color: Colors.accent, fontWeight: '500' },
  deleteBtn: { borderRightWidth: 0 },
  deleteBtnText: { fontSize: 12, color: Colors.red, fontWeight: '500' },
});