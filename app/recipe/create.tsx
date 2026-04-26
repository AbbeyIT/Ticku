import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Button, FormInput } from '@/components/UI';
import { Select } from '@/components/Select';
import { BottomSheet } from '@/components/BottomSheet';
import { useToast } from '@/components/Toast';
import { parseTime, formatTime, uid } from '@/utils/time';
import { BrewStep } from '@/utils/storage';

const BREW_METHODS = ['Hario V60','AeroPress','Hario Switch','Origami','French Press','Pour Over'];
const GRIND_SIZES = ['Extra Fine','Fine','Medium-Fine','Medium','Medium-Coarse','Coarse'];
const STEP_ICONS: Record<string, string> = { step: '☕', water: '💧', pause: '⏸' };
const STEP_COLORS: Record<string, string> = { step: Colors.text2, water: '#7ab8d9', pause: Colors.text3 };
const CAT_MAP: Record<string, string> = { 'Hario V60':'v60', 'AeroPress':'aeropress', 'Hario Switch':'switch', 'Origami':'origami' };

const emptyForm = { name:'', method:'Hario V60', beans:'15', water:'250', temp:'93', grind:'Medium-Fine', brewTime:'03:00' };

export default function CreateRecipeScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { getAllRecipes, addRecipe, updateRecipe } = useApp();
  const router = useRouter();
  const showToast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [steps, setSteps] = useState<BrewStep[]>([]);
  const [stepModal, setStepModal] = useState(false);
  const [stepType, setStepType] = useState<'step'|'water'|'pause'>('step');
  const [stepForm, setStepForm] = useState({ desc:'', dur:'00:30', ml:'' });

  useEffect(() => {
    if (editId) {
      const r = getAllRecipes().find((x) => x.id === editId);
      if (r) {
        setForm({ name:r.name, method:r.method, beans:String(r.beans), water:String(r.water), temp:String(r.temp), grind:r.grind, brewTime:r.brewTime });
        setSteps(r.steps ? [...r.steps] : []);
      }
    }
  }, [editId]);

  const totalSecs = parseTime(form.brewTime);
  const usedSecs = steps.reduce((s, st) => s + parseTime(st.dur), 0);
  const remSecs = totalSecs - usedSecs;
  const remColor = remSecs < 0 ? Colors.red : remSecs === 0 ? Colors.green : Colors.accent;

  const openStep = (t: 'step'|'water'|'pause') => {
    setStepType(t);
    setStepForm({ desc: t === 'pause' ? 'Wait / Pause' : '', dur:'00:30', ml:'' });
    setStepModal(true);
  };

  const confirmStep = () => {
    if (!stepForm.desc.trim()) { showToast('Add a description'); return; }
    const step: BrewStep = { type: stepType, desc: stepForm.desc.trim(), dur: stepForm.dur || '0:30' };
    if (stepType === 'water' && stepForm.ml) step.ml = parseInt(stepForm.ml, 10);
    setSteps((p) => [...p, step]);
    setStepModal(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Enter a recipe name'); return; }
    const recipe = {
      name: form.name.trim(), method: form.method, beans: parseInt(form.beans)||15,
      water: parseInt(form.water)||250, temp: parseInt(form.temp)||93,
      grind: form.grind, brewTime: form.brewTime,
      category: CAT_MAP[form.method]||'custom', custom: true, steps: [...steps],
    };
    if (editId) { await updateRecipe(editId, recipe); showToast('Recipe updated!'); }
    else { await addRecipe({ ...recipe, id: uid() }); showToast('Recipe saved!'); }
    router.back();
  };

  const F = (f: string) => (v: string) => setForm((p) => ({ ...p, [f]: v }));
  const SF = (f: string) => (v: string) => setStepForm((p) => ({ ...p, [f]: v }));

  let acc = 0;

  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editId ? 'Edit Recipe' : 'New Recipe'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <FormInput label="Recipe Name" value={form.name} onChangeText={F('name')} placeholder="e.g. My Morning V60" />
          <Select label="Brewing Method" value={form.method} options={BREW_METHODS} onChange={F('method')} />
          <View style={{ flexDirection:'row' }}>
            <View style={{ flex:1 }}><FormInput label="Beans (g)" value={form.beans} onChangeText={F('beans')} keyboardType="numeric" placeholder="15" /></View>
            <View style={{ width:10 }} />
            <View style={{ flex:1 }}><FormInput label="Water (ml)" value={form.water} onChangeText={F('water')} keyboardType="numeric" placeholder="250" /></View>
          </View>
          <View style={{ flexDirection:'row' }}>
            <View style={{ flex:1 }}><FormInput label="Temp (°C)" value={form.temp} onChangeText={F('temp')} keyboardType="numeric" placeholder="93" /></View>
            <View style={{ width:10 }} />
            <View style={{ flex:1 }}><Select label="Grind Size" value={form.grind} options={GRIND_SIZES} onChange={F('grind')} /></View>
          </View>
          <FormInput label="Total Brew Time (mm:ss)" value={form.brewTime} onChangeText={F('brewTime')} placeholder="03:00" />
        </View>

        <View style={styles.secHdr}>
          <Text style={styles.secTitle}>Brew Steps</Text>
          {totalSecs > 0 && <Text style={[styles.rem, { color: remColor }]}>
            {remSecs < 0 ? `Over by ${formatTime(Math.abs(remSecs))}` : `Remaining: ${formatTime(remSecs)}`}
          </Text>}
        </View>

        <View style={styles.alertBox}>
          <Text style={styles.alertText}>Each step counts down from total brew time. Add water pours and pauses as separate steps.</Text>
        </View>

        <View style={styles.stepsList}>
          {steps.length === 0 && <Text style={styles.noSteps}>No steps yet. Add brew steps, water pours, or pauses.</Text>}
          {steps.map((step, i) => {
            acc += parseTime(step.dur);
            const rem = totalSecs - acc;
            return (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepIconBadge}><Text>{STEP_ICONS[step.type]}</Text></View>
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                    <Text style={[styles.stepDesc, { color: STEP_COLORS[step.type] }]}>
                      {step.desc}{step.ml ? ` (${step.ml}ml)` : ''}
                    </Text>
                    <Text style={styles.stepDur}>{step.dur}</Text>
                  </View>
                  <Text style={styles.stepMeta}>
                    After: {formatTime(acc)} · Remaining:{' '}
                    <Text style={{ color: rem < 0 ? Colors.red : Colors.text3 }}>{formatTime(Math.max(0, rem))}</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSteps((p) => p.filter((_, idx) => idx !== i))} style={{ padding:4 }}>
                  <Text style={{ fontSize:20, color:Colors.text3 }}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.addStepRow}>
          {[
            { type:'step' as const, label:'+ Step', color: Colors.accent, borderColor: Colors.border2 },
            { type:'water' as const, label:'+ Water', color:'#7ab8d9', borderColor:'rgba(74,127,165,0.4)' },
            { type:'pause' as const, label:'+ Pause', color:Colors.text3, borderColor:'rgba(200,200,200,0.15)' },
          ].map((b) => (
            <TouchableOpacity key={b.type} style={[styles.addStepBtn, { borderColor: b.borderColor }]} onPress={() => openStep(b.type)}>
              <Text style={[styles.addStepText, { color: b.color }]}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {steps.length > 0 && (
          <>
            <View style={styles.secHdr}><Text style={styles.secTitle}>Timer Preview</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16, gap:6, paddingBottom:8 }}>
              {steps.map((step, i) => {
                const flex = Math.max(parseTime(step.dur)/60, 0.4);
                const bg = step.type==='water' ? 'rgba(74,127,165,0.15)' : step.type==='pause' ? 'rgba(255,255,255,0.04)' : 'rgba(200,146,42,0.08)';
                const bc = step.type==='water' ? 'rgba(74,127,165,0.3)' : step.type==='pause' ? Colors.border : Colors.border2;
                return (
                  <View key={i} style={[styles.previewBlock, { minWidth:60+flex*20, backgroundColor:bg, borderColor:bc }]}>
                    <Text style={{ fontSize:16 }}>{STEP_ICONS[step.type]}</Text>
                    <Text style={{ fontSize:11, color:Colors.text2, fontWeight:'500' }} numberOfLines={2}>{step.desc}</Text>
                    <Text style={{ fontSize:11, color:Colors.accent }}>{step.dur}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={{ paddingHorizontal:16, paddingTop:16 }}>
          <Button title="▶  Start Brewing Timer" onPress={async () => {
            if (!form.name.trim()) { showToast('Enter a recipe name first'); return; }
            if (!steps.length) { showToast('Add at least one step'); return; }
            const r = { id:'_live_'+Date.now(), name:form.name.trim()||'Untitled', method:form.method,
              beans:parseInt(form.beans)||15, water:parseInt(form.water)||250, temp:parseInt(form.temp)||93,
              grind:form.grind, brewTime:form.brewTime, category:CAT_MAP[form.method]||'custom',
              custom:true, steps:[...steps] };
            router.push({ pathname:'/timer/[id]' as any, params:{ id:'_live', recipe:JSON.stringify(r) } });
          }} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomSheet visible={stepModal} onClose={() => setStepModal(false)}
        title={stepType==='step' ? 'Add Brew Step' : stepType==='water' ? 'Add Water Pour' : 'Add Pause'}>
        <FormInput label="Description" value={stepForm.desc} onChangeText={SF('desc')}
          placeholder={stepType==='water' ? 'e.g. Bloom with 50ml water' : stepType==='pause' ? 'Wait / Pause' : 'e.g. Grind beans'} />
        <View style={{ flexDirection:'row' }}>
          <View style={{ flex:1 }}><FormInput label="Duration (mm:ss)" value={stepForm.dur} onChangeText={SF('dur')} placeholder="00:45" /></View>
          {stepType==='water' && (<><View style={{ width:10 }} /><View style={{ flex:1 }}><FormInput label="Water (ml)" value={stepForm.ml} onChangeText={SF('ml')} keyboardType="numeric" placeholder="50" /></View></>)}
        </View>
        <Button title="Add" onPress={confirmStep} style={{ marginTop:4 }} />
        <Button title="Cancel" onPress={() => setStepModal(false)} variant="ghost" style={{ marginTop:8 }} />
        <View style={{ height:16 }} />
      </BottomSheet>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { paddingHorizontal:20, paddingVertical:12, flexDirection:'row', alignItems:'center', borderBottomWidth:0.5, borderBottomColor:Colors.border, gap:12 },
  backBtn: { width:32, height:32, borderRadius:16, backgroundColor:Colors.surface, alignItems:'center', justifyContent:'center' },
  backArrow: { fontSize:18, color:Colors.text2 },
  headerTitle: { flex:1, fontSize:18, color:Colors.text, fontWeight:'500' },
  saveBtn: { backgroundColor:Colors.accent, borderRadius:Radius.sm, paddingVertical:8, paddingHorizontal:16 },
  saveBtnText: { color:Colors.bg, fontSize:14, fontWeight:'600' },
  card: { backgroundColor:Colors.bg2, borderWidth:0.5, borderColor:Colors.border, borderRadius:Radius.md, padding:16, margin:16, marginBottom:0 },
  secHdr: { paddingHorizontal:20, paddingTop:16, paddingBottom:8, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  secTitle: { fontSize:16, color:Colors.text, fontWeight:'500' },
  rem: { fontSize:12, fontWeight:'500' },
  alertBox: { marginHorizontal:16, backgroundColor:'rgba(200,146,42,0.08)', borderRadius:Radius.sm, padding:12, marginBottom:8 },
  alertText: { fontSize:12, color:Colors.text3, lineHeight:18 },
  stepsList: { paddingHorizontal:16 },
  noSteps: { fontSize:13, color:Colors.text3, paddingVertical:8 },
  stepItem: { flexDirection:'row', alignItems:'flex-start', gap:10, paddingVertical:10, borderBottomWidth:0.5, borderBottomColor:Colors.border },
  stepIconBadge: { width:28, height:28, borderRadius:14, backgroundColor:Colors.surface, alignItems:'center', justifyContent:'center' },
  stepDesc: { fontSize:14, fontWeight:'500', flex:1 },
  stepDur: { fontSize:12, color:Colors.accent, fontWeight:'500', marginLeft:8 },
  stepMeta: { fontSize:11, color:Colors.text3, marginTop:2 },
  addStepRow: { flexDirection:'row', gap:8, paddingHorizontal:16, paddingVertical:8 },
  addStepBtn: { flex:1, borderWidth:0.5, borderRadius:Radius.sm, paddingVertical:10, alignItems:'center' },
  addStepText: { fontSize:13, fontWeight:'500' },
  previewBlock: { borderWidth:0.5, borderRadius:8, padding:8, gap:4, minHeight:80 },
});