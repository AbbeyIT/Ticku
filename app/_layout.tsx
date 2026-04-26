import { ToastProvider } from "@/components/Toast";
import { Colors } from "@/constants/theme";
import { AppProvider } from "@/context/AppContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView as GHRV } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
const GestureHandlerRootView = GHRV as any;

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ToastProvider>
            <StatusBar style="light" backgroundColor={Colors.bg} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="recipe/[id]" />
              <Stack.Screen name="recipe/create" />
              <Stack.Screen name="timer/[id]" />
              <Stack.Screen name="more/stats" />
              <Stack.Screen name="more/backup" />
              <Stack.Screen name="more/about" />
              <Stack.Screen name="more/your-recipes" />
            </Stack>
          </ToastProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
