import { EmptyState, SectionHeader } from "@/components/UI";
import { Colors, Radius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const METHODS = ["All", "Hario V60", "AeroPress", "Hario Switch", "Origami"];

export default function HomeScreen() {
  const { data, getAllRecipes } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const allRecipes = useMemo(() => getAllRecipes(), [data]);
  const filtered = useMemo(() => {
    if (activeTab === "All") return allRecipes;
    return allRecipes.filter((r) => r.method === activeTab);
  }, [allRecipes, activeTab]);

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroSub}>Good morning ☕</Text>
            <Text style={styles.heroTitle}>
              Ready to <Text style={{ color: Colors.accent }}>brew</Text>?
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push("/recipe/create" as any)}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.ctaTitle}>Create New Recipe</Text>
              <Text style={styles.ctaSub}>Build your own brew method</Text>
            </View>
            <Text style={styles.ctaIcon}>+</Text>
          </TouchableOpacity>

          {data && data.brewLog.length > 0 && (
            <TouchableOpacity
              style={styles.statsRow}
              onPress={() => router.push("/more/stats" as any)}
              activeOpacity={0.8}
            >
              {[
                { num: data.brewLog.length, lbl: "Brews" },
                { num: data.beans.length, lbl: "Beans" },
                { num: data.favorites.length, lbl: "Saved" },
              ].map((s) => (
                <View key={s.lbl} style={styles.statPill}>
                  <Text style={styles.statNum}>{s.num}</Text>
                  <Text style={styles.statLbl}>{s.lbl}</Text>
                </View>
              ))}
            </TouchableOpacity>
          )}

          <SectionHeader
            title="Explore Recipes"
            action="See All"
            onAction={() => router.push("/(tabs)/explore" as any)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsWrap}
          >
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, activeTab === m && styles.tabActive]}
                onPress={() => setActiveTab(m)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === m && styles.tabTextActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.length === 0 ? (
            <EmptyState
              icon="☕"
              title="No recipes yet"
              sub="Create your first brew recipe"
              action="+ Create Recipe"
              onAction={() => router.push("/recipe/create" as any)}
            />
          ) : (
            filtered.slice(0, 8).map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/recipe/${recipe.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.recipeTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipeName} numberOfLines={1}>
                      {recipe.name}
                    </Text>
                    <Text style={styles.recipeMethod}>{recipe.method}</Text>
                  </View>
                  {data?.favorites?.includes(recipe.id) && (
                    <Text style={{ fontSize: 14 }}>❤️</Text>
                  )}
                  {recipe.custom && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom</Text>
                    </View>
                  )}
                </View>
                <View style={styles.recipeMeta}>
                  {[
                    { icon: "🫘", val: `${recipe.beans}g` },
                    { icon: "💧", val: `${recipe.water}ml` },
                    { icon: "🌡️", val: `${recipe.temp}°C` },
                    { icon: "⏱️", val: recipe.brewTime },
                  ].map((m) => (
                    <View key={m.icon} style={styles.metaPill}>
                      <Text style={styles.metaText}>
                        {m.icon} {m.val}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: Colors.bg3,
  },
  heroSub: { fontSize: 13, color: Colors.text3, marginBottom: 4 },
  heroTitle: { fontSize: 26, color: Colors.text, fontWeight: "400" },
  ctaCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  ctaSub: { fontSize: 12, color: Colors.text3 },
  ctaIcon: { fontSize: 28, color: Colors.accent },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.bg2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: "center",
  },
  statNum: { fontSize: 20, color: Colors.accent, fontWeight: "600" },
  statLbl: {
    fontSize: 10,
    color: Colors.text3,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tabsWrap: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  tab: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { fontSize: 13, color: Colors.text3, fontWeight: "500" },
  tabTextActive: { color: Colors.bg },
  recipeCard: {
    backgroundColor: Colors.bg2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  recipeTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  recipeMethod: { fontSize: 12, color: Colors.text3 },
  customBadge: {
    backgroundColor: "rgba(200,146,42,0.15)",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  customBadgeText: { fontSize: 10, color: Colors.accent2 },
  recipeMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaPill: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  metaText: { fontSize: 11, color: Colors.text2 },
});
