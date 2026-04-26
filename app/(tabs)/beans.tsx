import { BottomSheet } from "@/components/BottomSheet";
import { Select } from "@/components/Select";
import { useToast } from "@/components/Toast";
import { Button, EmptyState, FormInput } from "@/components/UI";
import { Colors, Radius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Bean } from "@/utils/storage";
import { uid } from "@/utils/time";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORIGINS = [
  "Ethiopia",
  "Colombia",
  "Guatemala",
  "Kenya",
  "Brazil",
  "Panama",
  "Yemen",
  "Indonesia",
  "Other",
];
const PROCESSES = ["Washed", "Natural", "Honey", "Anaerobic", "Wet-Hulled"];
const ROAST_LEVELS = ["Light", "Medium", "Dark"];
const EMOJIS = ["☕", "🫘", "🍒", "🫐", "🍇", "🌺", "🍯", "🌿"];
const ROAST_COLORS: Record<string, string> = {
  Light: "#a0c070",
  Medium: "#c8922a",
  Dark: "#5a3a1a",
};

const emptyBean = {
  roaster: "",
  name: "",
  origin: "Ethiopia",
  region: "",
  process: "Washed",
  roast: "Medium",
  notes: "",
  altitude: "",
  amountLeft: "",
  harvestDate: "",
  roastDate: "",
};

export default function BeansScreen() {
  const { data, addBean, deleteBean } = useApp();
  const showToast = useToast();
  const [filterOrigin, setFilterOrigin] = useState("all");
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [form, setForm] = useState(emptyBean);
  const [rating, setRating] = useState(3);

  const beans = useMemo(() => {
    if (!data?.beans) return [];
    if (filterOrigin === "all") return data.beans;
    return data.beans.filter((b) => b.origin === filterOrigin);
  }, [data?.beans, filterOrigin]);

  const origins = useMemo(
    () => [...new Set(data?.beans?.map((b) => b.origin) ?? [])],
    [data?.beans],
  );
  const filterOptions = [
    { value: "all", label: "All Origins" },
    ...origins.map((o) => ({ value: o, label: o })),
  ];

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Bean name required");
      return;
    }
    const bean: Bean = {
      id: uid(),
      roaster: form.roaster,
      name: form.name,
      origin: form.origin,
      region: form.region,
      process: form.process,
      roast: form.roast,
      notes: form.notes,
      rating,
      altitude: parseInt(form.altitude) || 0,
      amountLeft: parseInt(form.amountLeft) || 0,
      harvestDate: form.harvestDate,
      roastDate: form.roastDate,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    };
    await addBean(bean);
    setAddModal(false);
    setForm(emptyBean);
    setRating(3);
    showToast("Bean added! 🫘");
  };

  const handleDelete = () => {
    Alert.alert("Remove Bean", `Remove "${selectedBean?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteBean(selectedBean!.id);
          setDetailModal(false);
          showToast("Bean removed");
        },
      },
    ]);
  };

  const F = (field: string) => (v: string) =>
    setForm((f) => ({ ...f, [field]: v }));

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.hero}>
          <Text style={styles.heroSub}>Your collection</Text>
          <Text style={styles.heroTitle}>
            Coffee <Text style={{ color: Colors.accent }}>Beans</Text>
          </Text>
        </View>

        <View style={styles.filterRow}>
          <Select
            value={filterOrigin}
            options={filterOptions}
            onChange={setFilterOrigin}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setForm(emptyBean);
              setRating(3);
              setAddModal(true);
            }}
          >
            <Text style={styles.addBtnText}>+ Add Bean</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {beans.length === 0 ? (
            <EmptyState
              icon="🫘"
              title="No beans yet"
              sub="Add your first bag of coffee"
              action="+ Add Bean"
              onAction={() => setAddModal(true)}
            />
          ) : (
            <View style={styles.grid}>
              {beans.map((bean) => (
                <TouchableOpacity
                  key={bean.id}
                  style={styles.beanCard}
                  onPress={() => {
                    setSelectedBean(bean);
                    setDetailModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.beanEmoji}>
                    <Text style={{ fontSize: 32 }}>{bean.emoji || "☕"}</Text>
                  </View>
                  <Text style={styles.beanName} numberOfLines={1}>
                    {bean.name}
                  </Text>
                  <Text style={styles.beanOrigin}>{bean.origin}</Text>
                  <View style={styles.beanBottom}>
                    <View
                      style={[
                        styles.roastBadge,
                        { backgroundColor: `${ROAST_COLORS[bean.roast]}22` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roastText,
                          { color: ROAST_COLORS[bean.roast] },
                        ]}
                      >
                        {bean.roast}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: Colors.accent }}>
                      {"★".repeat(bean.rating)}
                    </Text>
                  </View>
                  <Text style={styles.beanAmount}>{bean.amountLeft}g left</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        <BottomSheet
          visible={addModal}
          onClose={() => setAddModal(false)}
          title="Add Coffee Bean"
        >
          <FormInput
            label="Roaster"
            value={form.roaster}
            onChangeText={F("roaster")}
            placeholder="e.g. Onyx Coffee Lab"
          />
          <FormInput
            label="Bean Name"
            value={form.name}
            onChangeText={F("name")}
            placeholder="e.g. Geometry"
          />
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Select
                label="Origin"
                value={form.origin}
                options={ORIGINS}
                onChange={F("origin")}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FormInput
                label="Region"
                value={form.region}
                onChangeText={F("region")}
                placeholder="Yirgacheffe"
              />
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Select
                label="Process"
                value={form.process}
                options={PROCESSES}
                onChange={F("process")}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <Select
                label="Roast Level"
                value={form.roast}
                options={ROAST_LEVELS}
                onChange={F("roast")}
              />
            </View>
          </View>
          <FormInput
            label="Tasting Notes"
            value={form.notes}
            onChangeText={F("notes")}
            placeholder="Blueberry, jasmine, honey"
          />
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Altitude (masl)"
                value={form.altitude}
                onChangeText={F("altitude")}
                keyboardType="numeric"
                placeholder="1800"
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FormInput
                label="Amount Left (g)"
                value={form.amountLeft}
                onChangeText={F("amountLeft")}
                keyboardType="numeric"
                placeholder="250"
              />
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Harvest Date"
                value={form.harvestDate}
                onChangeText={F("harvestDate")}
                placeholder="2024-Q3"
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FormInput
                label="Roast Date"
                value={form.roastDate}
                onChangeText={F("roastDate")}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>RATING</Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text
                    style={{
                      fontSize: 24,
                      color: n <= rating ? Colors.accent : Colors.text3,
                    }}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Button
            title="Save Bean"
            onPress={handleSave}
            style={{ marginTop: 8 }}
          />
          <Button
            title="Cancel"
            onPress={() => setAddModal(false)}
            variant="ghost"
            style={{ marginTop: 8 }}
          />
          <View style={{ height: 16 }} />
        </BottomSheet>

        <BottomSheet
          visible={detailModal}
          onClose={() => setDetailModal(false)}
          title={selectedBean?.name || ""}
        >
          {selectedBean && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 48 }}>
                  {selectedBean.emoji || "☕"}
                </Text>
                <View>
                  <Text style={styles.detailName}>{selectedBean.name}</Text>
                  <Text style={styles.detailRoaster}>
                    {selectedBean.roaster}
                  </Text>
                </View>
              </View>
              {[
                [
                  "Origin",
                  `${selectedBean.origin}${selectedBean.region ? ", " + selectedBean.region : ""}`,
                ],
                ["Process", selectedBean.process],
                ["Roast Level", selectedBean.roast],
                ["Tasting Notes", selectedBean.notes || "—"],
                [
                  "Altitude",
                  selectedBean.altitude ? `${selectedBean.altitude}masl` : "—",
                ],
                [
                  "Amount Left",
                  selectedBean.amountLeft ? `${selectedBean.amountLeft}g` : "—",
                ],
                ["Rating", "★".repeat(selectedBean.rating)],
                ["Harvest", selectedBean.harvestDate || "—"],
                ["Roasted", selectedBean.roastDate || "—"],
              ].map(([k, v]) => (
                <View key={k} style={styles.detailRow}>
                  <Text style={styles.detailKey}>{k}</Text>
                  <Text style={styles.detailVal}>{v}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  paddingVertical: 14,
                  marginTop: 8,
                }}
                onPress={handleDelete}
              >
                <Text style={{ fontSize: 13, color: Colors.red }}>
                  Remove Bean
                </Text>
              </TouchableOpacity>
              <View style={{ height: 16 }} />
            </>
          )}
        </BottomSheet>
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addBtnText: { color: Colors.bg, fontSize: 13, fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
    paddingTop: 4,
  },
  beanCard: {
    width: "46%",
    flexGrow: 1,
    backgroundColor: Colors.bg2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
  },
  beanEmoji: { alignItems: "center", marginBottom: 8 },
  beanName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  beanOrigin: { fontSize: 12, color: Colors.text3, marginBottom: 6 },
  beanBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roastBadge: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  roastText: { fontSize: 10, fontWeight: "600" },
  beanAmount: { fontSize: 11, color: Colors.text3 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  ratingLabel: {
    fontSize: 11,
    color: Colors.text3,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailName: { fontSize: 18, color: Colors.text, fontWeight: "600" },
  detailRoaster: { fontSize: 13, color: Colors.text3, marginTop: 2 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  detailKey: { fontSize: 13, color: Colors.text3, width: "40%" },
  detailVal: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
});
