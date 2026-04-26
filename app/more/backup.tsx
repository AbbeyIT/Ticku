import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/UI';
import { useToast } from '@/components/Toast';
import { AppData } from '@/utils/storage';

export default function BackupRestoreScreen() {
  const { data, addBackup, restoreFromBackup } = useApp();
  const router = useRouter();
  const showToast = useToast();
  const [restoring, setRestoring] = useState(false);

  const handleCreateBackup = async () => {
    try {
      const backupData = {
        version: '1.0',
        date: new Date().toISOString(),
        recipes: data?.recipes.filter((r) => r.custom) ?? [],
        beans: data?.beans ?? [],
        favorites: data?.favorites ?? [],
        brewLog: data?.brewLog ?? [],
      };
      const fileName = `ticku-${new Date().toISOString().slice(0, 10)}.ticku`;
      // expo-file-system v18 new API
      const file = new File(Paths.cache, fileName);
      file.write(JSON.stringify(backupData, null, 2));

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Ticku Backup',
        });
      }
      await addBackup({
        name: fileName,
        date: new Date().toLocaleDateString(),
        recipeCount: backupData.recipes.length,
        beanCount: backupData.beans.length,
        timestamp: new Date().toISOString(),
      });
      showToast('Backup exported! ✅');
    } catch (e) {
      console.error(e);
      showToast('Export failed');
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setRestoring(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) { setRestoring(false); return; }
      const uri = result.assets?.[0]?.uri;
      if (!uri) { showToast('Could not read file'); setRestoring(false); return; }

      const file = new File(uri);
      const content = file.text() as unknown as string;
      const parsed = JSON.parse(content) as Partial<AppData>;

      Alert.alert(
        'Restore Backup',
        `Import ${parsed.recipes?.length || 0} recipes and ${parsed.beans?.length || 0} beans? Existing data won't be overwritten.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setRestoring(false) },
          { text: 'Restore', onPress: async () => {
            await restoreFromBackup(parsed);
            showToast('Backup restored! ✅');
            setRestoring(false);
          }},
        ]
      );
    } catch (e) {
      console.error(e);
      showToast('Invalid backup file');
      setRestoring(false);
    }
  };

  const backups = data?.backups ?? [];

  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={{ fontSize: 24 }}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Your data stays local</Text>
            <Text style={styles.infoText}>No account or cloud required. Export backups to keep your data safe. Restore from a backup file on any device.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {([
            { icon: '📤', title: 'Create Backup', sub: 'Export your recipes, beans, and brew log', onPress: handleCreateBackup, btnLabel: 'Export', variant: 'primary' as const },
            { icon: '📥', title: 'Restore Backup', sub: 'Import from a .ticku backup file', onPress: handleRestoreBackup, btnLabel: restoring ? '…' : 'Import', variant: 'outline' as const },
          ] as const).map((item) => (
            <View key={item.title} style={styles.actionCard}>
              <View style={styles.actionLeft}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionSub}>{item.sub}</Text>
                </View>
              </View>
              <Button title={item.btnLabel} onPress={item.onPress} variant={item.variant} style={styles.actionBtn} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup History</Text>
          {backups.length === 0 ? (
            <Text style={styles.noBackups}>No backups yet. Create your first backup above.</Text>
          ) : (
            backups.map((b, i) => (
              <View key={i} style={styles.backupItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.backupName}>{b.name}</Text>
                  <Text style={styles.backupMeta}>{b.date} · {b.recipeCount} recipes · {b.beanCount || 0} beans</Text>
                </View>
              </View>
            ))
          )}
        </View>
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
  infoCard: { margin: 16, backgroundColor: 'rgba(200,146,42,0.08)', borderWidth: 0.5, borderColor: Colors.border2, borderRadius: Radius.md, padding: 14, flexDirection: 'row', gap: 12 },
  infoTitle: { fontSize: 14, color: Colors.text, fontWeight: '500', marginBottom: 4 },
  infoText: { fontSize: 12, color: Colors.text3, lineHeight: 18 },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 11, color: Colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  actionCard: { backgroundColor: Colors.bg2, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, marginBottom: 10 },
  actionLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  actionTitle: { fontSize: 14, color: Colors.text, fontWeight: '500', marginBottom: 2 },
  actionSub: { fontSize: 12, color: Colors.text3 },
  actionBtn: { alignSelf: 'flex-end' },
  noBackups: { fontSize: 13, color: Colors.text3, paddingVertical: 8 },
  backupItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  backupName: { fontSize: 13, color: Colors.text, fontWeight: '500', marginBottom: 2 },
  backupMeta: { fontSize: 11, color: Colors.text3 },
});