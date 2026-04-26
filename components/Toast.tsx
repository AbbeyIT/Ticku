import { Colors, Radius } from "@/constants/theme";
import React, {
  createContext,
  useContext,
  useRef,
  useState
} from "react";
import { Animated, StyleSheet, Text } from "react-native";

const ToastContext = createContext<{
  showToast: (msg: string, duration?: number) => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, duration = 2500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    timerRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View style={[styles.toast, { opacity }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx.showToast;
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: Colors.surface2,
    borderWidth: 0.5,
    borderColor: Colors.border2,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 9999,
    maxWidth: 300,
  },
  text: { color: Colors.text, fontSize: 13 },
});
