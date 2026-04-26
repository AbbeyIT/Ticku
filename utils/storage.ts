import * as FileSystem from "expo-file-system/legacy";

const STORAGE_FILE = FileSystem.documentDirectory + "ticku_data.json";

export interface BrewStep {
  type: "step" | "water" | "pause";
  desc: string;
  dur: string;
  ml?: number;
}

export interface Recipe {
  id: string;
  name: string;
  method: string;
  category: string;
  beans: number;
  water: number;
  temp: number;
  grind: string;
  brewTime: string;
  custom: boolean;
  description?: string;
  steps: BrewStep[];
}

export interface Bean {
  id: string;
  roaster: string;
  name: string;
  origin: string;
  region: string;
  process: string;
  roast: string;
  notes: string;
  rating: number;
  altitude: number;
  amountLeft: number;
  harvestDate: string;
  roastDate: string;
  emoji: string;
}

export interface BrewLogEntry {
  recipeId: string;
  date: string;
}

export interface BackupRecord {
  name: string;
  date: string;
  recipeCount: number;
  beanCount: number;
  timestamp: string;
}

export interface AppData {
  recipes: Recipe[];
  beans: Bean[];
  favorites: string[];
  brewLog: BrewLogEntry[];
  backups: BackupRecord[];
}

export const defaultData: AppData = {
  recipes: [],
  beans: [],
  favorites: [],
  brewLog: [],
  backups: [],
};

let memoryCache: AppData | null = null;

export const loadData = async (): Promise<AppData> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);

    if (fileInfo.exists) {
      const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
      const parsed = JSON.parse(raw) as Partial<AppData>;
      const result: AppData = { ...defaultData, ...parsed };
      memoryCache = result;
      return result;
    }

    memoryCache = { ...defaultData };
    return memoryCache;
  } catch (e) {
    console.warn("FileSystem load failed, using memory fallback");
    if (!memoryCache) memoryCache = { ...defaultData };
    return memoryCache;
  }
};

export const saveData = async (data: AppData): Promise<void> => {
  memoryCache = data;

  try {
    await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(data));
  } catch (e) {
    console.warn("FileSystem save failed, data held in memory");
  }
};
