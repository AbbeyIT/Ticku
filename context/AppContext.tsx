import { BUILT_IN_RECIPES } from "@/data/recipes";
import {
    AppData,
    BackupRecord,
    Bean,
    BrewLogEntry,
    loadData,
    Recipe,
    saveData,
} from "@/utils/storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface AppContextType {
  data: AppData | null;
  loading: boolean;
  getAllRecipes: () => Recipe[];
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addBean: (bean: Bean) => Promise<void>;
  updateBean: (id: string, updates: Partial<Bean>) => Promise<void>;
  deleteBean: (id: string) => Promise<void>;
  logBrew: (recipeId: string) => Promise<void>;
  addBackup: (backup: BackupRecord) => Promise<void>;
  restoreFromBackup: (backupData: Partial<AppData>) => Promise<void>;
  save: (data: AppData) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (newData: AppData) => {
    setData(newData);
    await saveData(newData);
  }, []);

  const getAllRecipes = useCallback((): Recipe[] => {
    if (!data) return BUILT_IN_RECIPES;
    return [...BUILT_IN_RECIPES, ...data.recipes];
  }, [data]);

  const addRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!data) return;
      await save({ ...data, recipes: [...data.recipes, recipe] });
    },
    [data, save],
  );

  const updateRecipe = useCallback(
    async (id: string, updates: Partial<Recipe>) => {
      if (!data) return;
      await save({
        ...data,
        recipes: data.recipes.map((r) =>
          r.id === id ? { ...r, ...updates } : r,
        ),
      });
    },
    [data, save],
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      if (!data) return;
      await save({ ...data, recipes: data.recipes.filter((r) => r.id !== id) });
    },
    [data, save],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!data) return;
      const favs = data.favorites.includes(id)
        ? data.favorites.filter((f) => f !== id)
        : [...data.favorites, id];
      await save({ ...data, favorites: favs });
    },
    [data, save],
  );

  const addBean = useCallback(
    async (bean: Bean) => {
      if (!data) return;
      await save({ ...data, beans: [...data.beans, bean] });
    },
    [data, save],
  );

  const updateBean = useCallback(
    async (id: string, updates: Partial<Bean>) => {
      if (!data) return;
      await save({
        ...data,
        beans: data.beans.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      });
    },
    [data, save],
  );

  const deleteBean = useCallback(
    async (id: string) => {
      if (!data) return;
      await save({ ...data, beans: data.beans.filter((b) => b.id !== id) });
    },
    [data, save],
  );

  const logBrew = useCallback(
    async (recipeId: string) => {
      if (!data) return;
      const entry: BrewLogEntry = { recipeId, date: new Date().toISOString() };
      await save({ ...data, brewLog: [...data.brewLog, entry] });
    },
    [data, save],
  );

  const addBackup = useCallback(
    async (backup: BackupRecord) => {
      if (!data) return;
      await save({ ...data, backups: [backup, ...data.backups] });
    },
    [data, save],
  );

  const restoreFromBackup = useCallback(
    async (backupData: Partial<AppData>) => {
      if (!data) return;
      const current = { ...data };
      if (backupData.recipes) {
        backupData.recipes.forEach((r) => {
          if (!current.recipes.find((x) => x.id === r.id))
            current.recipes.push(r);
        });
      }
      if (backupData.beans) {
        backupData.beans.forEach((b) => {
          if (!current.beans.find((x) => x.id === b.id)) current.beans.push(b);
        });
      }
      if (backupData.favorites) {
        backupData.favorites.forEach((f) => {
          if (!current.favorites.includes(f)) current.favorites.push(f);
        });
      }
      await save(current);
    },
    [data, save],
  );

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        getAllRecipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleFavorite,
        addBean,
        updateBean,
        deleteBean,
        logBrew,
        addBackup,
        restoreFromBackup,
        save,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
