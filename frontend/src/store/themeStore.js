import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: true, // Default to dark mode for Nexus
      toggleTheme: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (!newMode) {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
        return { isDarkMode: newMode };
      }),
      initTheme: () => set((state) => {
        if (!state.isDarkMode) {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
        return state;
      })
    }),
    {
      name: 'nexus-theme-storage',
    }
  )
);

export default useThemeStore;
