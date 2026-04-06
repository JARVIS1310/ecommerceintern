import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type StoreMood = 'focus' | 'adventure' | 'cozy';

interface ThemeContextType {
  mood: StoreMood;
  setMood: (mood: StoreMood) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<StoreMood>(() => {
    const savedMood = window.localStorage.getItem('store-mood');

    if (savedMood === 'focus' || savedMood === 'adventure' || savedMood === 'cozy') {
      return savedMood;
    }

    return 'focus';
  });

  useEffect(() => {
    document.body.classList.remove('mood-focus', 'mood-adventure', 'mood-cozy');
    document.body.classList.add(`mood-${mood}`);
    document.body.dataset.mood = mood;
    window.localStorage.setItem('store-mood', mood);
  }, [mood]);

  const value = useMemo(() => ({ mood, setMood }), [mood]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMood() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMood must be used within ThemeProvider');
  }

  return context;
}
