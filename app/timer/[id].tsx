import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/Toast';
import { parseTime, formatTime } from '@/utils/time';
import { Recipe } from '@/utils/storage';

const RING_R = 80;
const RING_C = 2 * Math.PI * RING_R;
const STEP_ICONS: Record<string, string> = { step: '☕', water: '💧', pause: '⏸' };
const STEP_COLORS: Record<string, string> = { step: Colors.text2, water: '#7ab8d9', pause: Colors.text3 };

export default function BrewTimerScreen() {
  const { id, recipe: recipeParam } = useLocalSearchParams<{ id: string; recipe?: string }>();
  const { data, getAllRecipes, toggleFavorite, logBrew } = useApp();
  const router = useRouter();
  const showToast = useToast();

  const recipe: Recipe | undefined = useMemo(() => {
    if (recipeParam) { try { return JSON.parse(recipeParam); } catch {} }
    return getAllRecipes().find((r) => r.id === id);
  }, [id, recipeParam, data]);

  const steps = recipe?.steps ?? [];

  const [curIdx, setCurIdx] = useState(0);
  const [stepSecs, setStepSecs] = useState(0);
  const [stepTotal, setStepTotal] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const [totalStart, setTotalStart] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggedRef = useRef(false);

  const strokeOffset = stepTotal === 0 ? 0 : RING_C * (1 - (stepTotal - stepSecs) / stepTotal);
  const overallPct = totalStart === 0 ? 0 : Math.min(100, ((totalStart - totalSecs) / totalStart) * 100);

  useEffect(() => {
    if (!recipe || !steps.length) return;
    const first = parseTime(steps[0].dur);
    const total = steps.reduce((s, st) => s + parseTime(st.dur), 0);
    setCurIdx(0); setStepSecs(first); setStepTotal(first);
    setTotalSecs(total); setTotalStart(total);
    setDoneSteps([]); setFinished(false);
  }, [recipe?.id]);

  useEffect(() => {
    if (!loggedRef.current && recipe?.id && !recipe.id.startsWith('_live')) {
      loggedRef.current = true;
      logBrew(recipe.id).catch(() => {});
    }
  }, []);

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  const advance = useCallback((ci: number) => {
    if (ci >= steps.length - 1) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false); setStepSecs(0); setTotalSecs(0); setFinished(true);
      setDoneSteps(steps.map((_, i) => i));
      showToast('Brew complete! ☕', 3000);
      return;
    }
    setDoneSteps((p) => [...p, ci]);
    const ni = ci + 1;
    const nd = parseTime(steps[ni].dur);
    setCurIdx(ni); setStepSecs(nd); setStepTotal(nd);
  }, [steps]);

  const tick = useCallback(() => {
    setStepSecs((prev) => {
      if (prev <= 1) {
        setCurIdx((ci) => { advance(ci); return ci; });
        setTotalSecs((t) => Math.max(0, t - 1));
        return 0;
      }
      setTotalSecs((t) => Math.max(0, t - 1));
      return prev - 1;
    });
  }, [advance]);

  const handlePlayPause = () => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      intervalRef.current = setInterval(tick, 1000);
      setRunning(true);
    }
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    Alert.alert('Stop Brew', 'Stop the current brew?', [
      { text: 'Keep Going', style: 'cancel', onPress: () => { intervalRef.current = setInterval(tick, 1000); setRunning(true); }},
      { text: 'Stop', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const handleSkip = () => {
    if (finished) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTotalSecs((t) => Math.max(0, t - stepSecs));
    advance(curIdx);
    if (running) intervalRef.current = setInterval(tick, 1000);
  };

  if (!recipe) return null;

  const isFav = data?.favorites?.includes(recipe.id);
  const curStep = steps[curIdx];
  const isWater = curStep?.type === 'water';
  const isPause = curStep?.type === 'pause';
  const ringColor = isWater ? Colors.water : isPause ? Colors.text3 : Colors.accent;

  return (
    <View style={styles.safe}><SafeAreaView edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleStop}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        <TouchableOpacity onPress={async () => { await toggleFavorite(recipe.id); showToast(isFav ? 'Removed' : '❤️ Saved!'); }} style={{ padding:4 }}>
          <Text style={{ fontSize:22 }}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepIndicatorText}>STEP {curIdx+1} / {steps.length}</Text>
            <Text style={styles.totalLeft}>TOTAL LEFT: <Text style={{ color:Colors.accent2 }}>{formatTime(totalSecs)}</Text></Text>
          </View>

          <View style={styles.ringWrap}>
            <Svg width={180} height={180} style={{ transform:[{ rotate:'-90deg' }] }}>
              <Circle cx={90} cy={90} r={RING_R} fill="none" stroke={Colors.surface} strokeWidth={8} />
              <Circle cx={90} cy={90} r={RING_R} fill="none" stroke={ringColor} strokeWidth={8}
                strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={finished ? 0 : strokeOffset} />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.ringTime}>{finished ? '00:00' : formatTime(stepSecs)}</Text>
              <Text style={styles.ringStepName} numberOfLines={1}>{finished ? 'Done!' : curStep?.desc || '—'}</Text>
            </View>
          </View>

          <View style={[styles.stepPill, isWater && styles.stepPillWater, isPause && styles.stepPillPause, finished && styles.stepPillDone]}>
            <Text style={[styles.stepPillText, isWater&&{color:'#7ab8d9'}, isPause&&{color:Colors.text3}, finished&&{color:'#8dc898'}]}>
              {finished ? '✓ Brew complete! Enjoy your coffee!' : `${STEP_ICONS[curStep?.type||'step']} ${curStep?.desc||'Press play to begin'}`}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.ctrlStop} onPress={handleStop}><Text style={{ color:Colors.red, fontSize:18 }}>■</Text></TouchableOpacity>
            <TouchableOpacity style={styles.ctrlPlay} onPress={handlePlayPause} disabled={finished}><Text style={{ color:Colors.bg, fontSize:28 }}>{running ? '⏸' : '▶'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.ctrlSkip} onPress={handleSkip} disabled={finished}><Text style={{ color:Colors.text2, fontSize:18 }}>⏭</Text></TouchableOpacity>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width:`${overallPct}%` as any, backgroundColor:ringColor }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Start</Text>
            <Text style={styles.progressLabel}>{Math.round(overallPct)}%</Text>
            <Text style={styles.progressLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <Text style={styles.tlTitle}>BREW INTERVALS</Text>
          {steps.map((step, i) => {
            const isDone = doneSteps.includes(i);
            const isActive = i === curIdx && !finished;
            const dotColor = isDone ? Colors.green : isActive ? STEP_COLORS[step.type] : Colors.surface2;
            return (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.tlDot, { backgroundColor:dotColor, borderColor:dotColor }]} />
                  {i < steps.length-1 && <View style={[styles.tlLine, isDone&&{backgroundColor:Colors.green}]} />}
                </View>
                <View style={styles.tlContent}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <Text style={[styles.tlName, isActive&&{color:Colors.accent2}, isDone&&{color:Colors.text3}]}>
                      {STEP_ICONS[step.type]} {step.desc}{step.ml ? <Text style={{ color:'#7ab8d9', fontSize:11 }}> ({step.ml}ml)</Text> : null}
                    </Text>
                    <Text style={[styles.tlTime, isActive&&{color:Colors.accent}, isDone&&{color:Colors.green}]}>{step.dur}</Text>
                  </View>
                  {isActive && (
                    <View style={styles.tlProg}>
                      <View style={[styles.tlProgFill, { width:`${stepTotal>0?((stepTotal-stepSecs)/stepTotal)*100:0}%` as any, backgroundColor:isWater?Colors.water:Colors.accent }]} />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height:40 }} />
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { paddingHorizontal:20, paddingVertical:12, flexDirection:'row', alignItems:'center', borderBottomWidth:0.5, borderBottomColor:Colors.border, backgroundColor:Colors.bg3, gap:12 },
  backBtn: { width:32, height:32, borderRadius:16, backgroundColor:Colors.surface, alignItems:'center', justifyContent:'center' },
  backArrow: { fontSize:18, color:Colors.text2 },
  headerTitle: { flex:1, fontSize:16, color:Colors.text, fontWeight:'500' },
  hero: { paddingHorizontal:20, paddingTop:20, paddingBottom:16, backgroundColor:Colors.bg3, borderBottomWidth:0.5, borderBottomColor:Colors.border },
  stepIndicator: { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  stepIndicatorText: { fontSize:12, color:Colors.text3 },
  totalLeft: { fontSize:12, color:Colors.text3 },
  ringWrap: { alignSelf:'center', width:180, height:180, alignItems:'center', justifyContent:'center', marginBottom:16 },
  ringCenter: { position:'absolute', alignItems:'center', width:140, height:80, justifyContent:'center' },
  ringTime: { fontSize:42, color:Colors.text, fontWeight:'300', letterSpacing:1 },
  ringStepName: { fontSize:12, color:Colors.text3, marginTop:4, textAlign:'center' },
  stepPill: { backgroundColor:Colors.surface, borderRadius:20, paddingVertical:8, paddingHorizontal:16, marginBottom:16, alignItems:'center', minHeight:36, justifyContent:'center' },
  stepPillWater: { backgroundColor:'rgba(74,127,165,0.2)' },
  stepPillPause: { backgroundColor:Colors.surface },
  stepPillDone: { backgroundColor:'rgba(90,154,106,0.2)' },
  stepPillText: { fontSize:13, color:Colors.text2, textAlign:'center' },
  controls: { flexDirection:'row', justifyContent:'center', alignItems:'center', gap:16, marginBottom:20 },
  ctrlStop: { width:48, height:48, borderRadius:24, backgroundColor:'rgba(196,90,74,0.15)', alignItems:'center', justifyContent:'center' },
  ctrlPlay: { width:68, height:68, borderRadius:34, backgroundColor:Colors.accent, alignItems:'center', justifyContent:'center', shadowColor:Colors.accent, shadowOpacity:0.3, shadowRadius:12, shadowOffset:{width:0,height:4} },
  ctrlSkip: { width:48, height:48, borderRadius:24, backgroundColor:Colors.surface, alignItems:'center', justifyContent:'center' },
  progressTrack: { height:6, backgroundColor:Colors.surface, borderRadius:3, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:3 },
  progressLabels: { flexDirection:'row', justifyContent:'space-between', paddingTop:4 },
  progressLabel: { fontSize:11, color:Colors.text3 },
  timeline: { padding:16, paddingTop:20 },
  tlTitle: { fontSize:11, color:Colors.text3, fontWeight:'500', textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 },
  tlRow: { flexDirection:'row', alignItems:'stretch' },
  tlLeft: { width:32, alignItems:'center' },
  tlDot: { width:12, height:12, borderRadius:6, backgroundColor:Colors.surface2, borderWidth:2, marginTop:3, flexShrink:0 },
  tlLine: { flex:1, width:2, backgroundColor:Colors.surface2, minHeight:16, marginVertical:2 },
  tlContent: { flex:1, paddingLeft:10, paddingBottom:16 },
  tlName: { fontSize:14, color:Colors.text, fontWeight:'500', flex:1 },
  tlTime: { fontSize:12, color:Colors.text3, fontWeight:'500', marginLeft:8, flexShrink:0 },
  tlProg: { height:3, backgroundColor:Colors.surface, borderRadius:2, marginTop:8, overflow:'hidden' },
  tlProgFill: { height:'100%', borderRadius:2 },
});