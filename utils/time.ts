export const parseTime = (str: string | number): number => {
  if (!str) return 0;
  const s = String(str);
  const parts = s.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return parseInt(s, 10) || 0;
};

export const formatTime = (secs: number): string => {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export const uid = (): string =>
  `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
