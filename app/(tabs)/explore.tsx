import { EmptyState } from "@/components/UI";
import { Colors, Radius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "v60", label: "Hario V60" },
  { id: "aeropress", label: "AeroPress" },
  { id: "switch", label: "Hario Switch" },
  { id: "origami", label: "Origami" },
  { id: "custom", label: "My Recipes" },
];

export default function ExploreScreen() {
  const { data, getAllRecipes } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const allRecipes = useMemo(() => getAllRecipes(), [data]);
  const filtered = useMemo(() => {
    let list = allRecipes;
    if (activeTab === "favorites")
      list = list.filter((r) => data?.favorites?.includes(r.id));
    else if (activeTab === "custom") list = list.filter((r) => r.custom);
    else if (activeTab !== "all")
      list = list.filter((r) => r.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.method.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allRecipes, activeTab, search, data?.favorites]);

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recipes</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push("/recipe/create" as any)}
          >
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes…"
            placeholderTextColor={Colors.text3}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsWrap}
        >
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, activeTab === t.id && styles.tabActive]}
              onPress={() => setActiveTab(t.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === t.id && styles.tabTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="☕"
              title={
                activeTab === "favorites"
                  ? "No favorites yet"
                  : "No recipes found"
              }
              sub={
                activeTab === "favorites"
                  ? "Heart a recipe to save it here"
                  : "Try a different filter"
              }
            />
          ) : (
            filtered.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => router.push(`/recipe/${recipe.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {recipe.name}
                    </Text>
                    <Text style={styles.cardMethod}>{recipe.method}</Text>
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
                {recipe.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                )}
                <View style={styles.cardMeta}>
                  {[
                    { icon: "🫘", val: `${recipe.beans}g` },
                    { icon: "💧", val: `${recipe.water}ml` },
                    { icon: "🌡️", val: `${recipe.temp}°C` },
                    { icon: "⏱️", val: recipe.brewTime },
                    { icon: "⚙️", val: recipe.grind },
                  ].map((m) => (
                    <View key={m.icon} style={styles.metaPill}>
                      <Text style={styles.metaText}>
                        {m.icon} {m.val}
                      </Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.brewBtn}
                  onPress={() => router.push(`/timer/${recipe.id}` as any)}
                >
                  <Text style={styles.brewBtnText}>▶ Brew</Text>
                </TouchableOpacity>
              </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: { flex: 1, fontSize: 20, color: Colors.text, fontWeight: "500" },
  newBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  newBtnText: { color: Colors.bg, fontSize: 13, fontWeight: "600" },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.text,
    fontSize: 14,
  },
  tabsWrap: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  tab: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { fontSize: 13, color: Colors.text3, fontWeight: "500" },
  tabTextActive: { color: Colors.bg },
  card: {
    backgroundColor: Colors.bg2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  cardName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardMethod: { fontSize: 12, color: Colors.text3 },
  customBadge: {
    backgroundColor: "rgba(200,146,42,0.15)",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  customBadgeText: { fontSize: 10, color: Colors.accent2 },
  cardDesc: {
    fontSize: 12,
    color: Colors.text3,
    marginBottom: 10,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  metaPill: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  metaText: { fontSize: 11, color: Colors.text2 },
  brewBtn: {
    backgroundColor: "rgba(200,146,42,0.12)",
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    alignItems: "center",
  },
  brewBtnText: { fontSize: 13, color: Colors.accent, fontWeight: "500" },
});
