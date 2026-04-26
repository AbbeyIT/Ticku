import { Platform } from "react-native";

export const Colors = {
  bg: "#0f0d0a",
  bg2: "#1a1612",
  bg3: "#252018",
  surface: "#332b22",
  surface2: "#3d342a",
  accent: "#c8922a",
  accent2: "#e8b84b",
  text: "#f5ede0",
  text2: "#c4b49a",
  text3: "#8a7a66",
  border: "rgba(200,146,42,0.2)",
  border2: "rgba(200,146,42,0.38)",
  green: "#5a9a6a",
  red: "#c45a4a",
  water: "#4a7fa5",
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
})!;
