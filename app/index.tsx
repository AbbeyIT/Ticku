import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

// Note: Defs, RadialGradient, Stop still used by TickuMascot

const { width, height } = Dimensions.get("window");

// ─── Ticku mascot drawn with SVG ────────────────────────────────────────────
function TickuMascot() {
  return (
    <Svg width={130} height={160} viewBox="0 0 130 120">
      <Defs>
        <RadialGradient id="bodyGrad" cx="50%" cy="45%" r="55%">
          <Stop offset="0%" stopColor="#c45a6a" />
          <Stop offset="100%" stopColor="#7a1f30" />
        </RadialGradient>
        <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#c45a6a" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#c45a6a" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Glow behind body */}
      <Ellipse cx="65" cy="115" rx="42" ry="14" fill="rgba(196,90,106,0.18)" />

      {/* Stem */}
      <Path
        d="M65 42 Q70 28 80 22"
        stroke="#3a7d2f"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaf */}
      <Ellipse
        cx="83"
        cy="19"
        rx="13"
        ry="7"
        fill="#4CAF50"
        transform="rotate(-30 83 19)"
      />
      <Path
        d="M76 24 Q84 18 90 14"
        stroke="#2e7d32"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Main body – coffee cherry shape */}
      <Ellipse cx="65" cy="95" rx="40" ry="42" fill="url(#bodyGrad)" />

      {/* Shine on body */}
      <Ellipse
        cx="53"
        cy="76"
        rx="10"
        ry="7"
        fill="rgba(255,255,255,0.12)"
        transform="rotate(-20 53 76)"
      />

      {/* Eyes whites */}
      <Ellipse cx="52" cy="88" rx="10" ry="11" fill="white" />
      <Ellipse cx="78" cy="88" rx="10" ry="11" fill="white" />

      {/* Pupils */}
      <Ellipse cx="54" cy="89" rx="6" ry="7" fill="#1a0a0a" />
      <Ellipse cx="80" cy="89" rx="6" ry="7" fill="#1a0a0a" />

      {/* Eye shine dots */}
      <Circle cx="56" cy="86" r="2" fill="white" />
      <Circle cx="82" cy="86" r="2" fill="white" />

      {/* Smile */}
      <Path
        d="M52 104 Q65 116 78 104"
        stroke="#7a1f30"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <Ellipse cx="42" cy="98" rx="7" ry="5" fill="rgba(255,120,140,0.35)" />
      <Ellipse cx="88" cy="98" rx="7" ry="5" fill="rgba(255,120,140,0.35)" />

      {/* Little feet / nubs */}
      <Ellipse cx="50" cy="133" rx="10" ry="6" fill="#7a1f30" />
      <Ellipse cx="80" cy="133" rx="10" ry="6" fill="#7a1f30" />

      {/* Tiny arms */}
      <Path
        d="M26 100 Q20 108 22 118"
        stroke="#7a1f30"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M104 100 Q110 108 108 118"
        stroke="#7a1f30"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// ─── Full-screen concentric circles radiating from mascot focal point ───────
function GlowRing({ opacity }: { opacity: SharedValue<number> }) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // SVG covers the full screen
  const vw = width;
  const vh = height;

  // Focal point: horizontally centred, ~38% down (behind the mascot)
  const cx = vw / 2;
  const cy = vh * 0.38;

  // Max radius to reach the furthest screen corner
  const maxR = Math.sqrt(
    Math.max(cx, vw - cx) ** 2 + Math.max(cy, vh - cy) ** 2,
  );

  // Build evenly-spaced rings
  const step = 36;
  const radii: number[] = [];
  for (let r = step; r <= maxR + step; r += step) {
    radii.push(r);
  }

  return (
    <Animated.View style={[styles.glowRingContainer, animStyle]}>
      <Svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`}>
        {radii.map((r, i) => {
          const progress = r / maxR;
          const alpha = Math.max(0.04, 0.5 * (1 - progress));
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={`rgba(190,120,40,${alpha.toFixed(2)})`}
              strokeWidth={0.8}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

// ─── Main splash screen ──────────────────────────────────────────────────────
export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const mascotY = useSharedValue(30);
  const mascotOpacity = useSharedValue(0);
  const mascotScale = useSharedValue(0.7);
  const mascotBob = useSharedValue(0);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);

  const subtitleOpacity = useSharedValue(0);

  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(20);
  const buttonScale = useSharedValue(1);

  const versionOpacity = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    // Ring fade in
    ringOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));

    // Mascot entrance
    mascotOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    mascotY.value = withDelay(
      300,
      withSpring(0, { damping: 14, stiffness: 120 }),
    );
    mascotScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );

    // Gentle bobbing after entrance
    mascotBob.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );

    // Title
    titleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    titleY.value = withDelay(
      700,
      withSpring(0, { damping: 16, stiffness: 130 }),
    );

    // Subtitle
    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

    // Button
    buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    buttonY.value = withDelay(
      1100,
      withSpring(0, { damping: 16, stiffness: 130 }),
    );

    // Version label
    versionOpacity.value = withDelay(1300, withTiming(1, { duration: 400 }));
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
    transform: [
      { translateY: mascotY.value + mascotBob.value },
      { scale: mascotScale.value },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonContainerStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const buttonPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const versionStyle = useAnimatedStyle(() => ({
    opacity: versionOpacity.value,
  }));

  const handleStartBrewing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 80 }),
      withSpring(1, { damping: 10 }),
    );
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 150);
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 12 });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0e07" />

      {/* Decorative ring — sits behind everything */}
      <GlowRing opacity={ringOpacity} />

      {/* Content */}
      <View style={styles.content}>
        {/* Mascot */}
        <Animated.View style={[styles.mascotWrapper, mascotStyle]}>
          <TickuMascot />
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>Ticku</Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your everyday coffee brewing companion
        </Animated.Text>

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
          <Animated.View style={buttonPressStyle}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={1}
              onPress={handleStartBrewing}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={styles.buttonText}>Start Brewing </Text>
              <Text style={styles.buttonEmoji}>☕</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Version label */}
        <Animated.Text style={[styles.version, versionStyle]}>
          v1.0 · No account needed
        </Animated.Text>
      </View>
    </View>
  );
}

const RING_SIZE = width * 0.78;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0e07",
    alignItems: "center",
    justifyContent: "center",
  },
  glowRingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: -height * 0.08,
  },
  mascotWrapper: {
    marginBottom: 3,
    marginTop: height * 0.04,
  },
  title: {
    fontSize: 52,
    fontWeight: "800",
    color: "#F5A623",
    letterSpacing: 1,
    marginTop: 4,
    textShadowColor: "rgba(245,166,35,0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    marginTop: 6,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 44,
    width: "100%",
  },
  button: {
    backgroundColor: "#E8A020",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c47a20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a0e07",
    letterSpacing: 0.3,
  },
  buttonEmoji: {
    fontSize: 17,
  },
  version: {
    marginTop: 20,
    fontSize: 12,
    color: "rgba(255,255,255,0.28)",
    letterSpacing: 0.3,
  },
});
