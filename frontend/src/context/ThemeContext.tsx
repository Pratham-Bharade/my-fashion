import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (e?: React.MouseEvent | React.TouchEvent) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('vandana-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default is always Light Mode on first visit
  });

  const [reveal, setReveal] = useState<{ x: number; y: number; background: string; key: number } | null>(null);

  // Synchronize <html> class on theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vandana-theme', theme);
  }, [theme]);

  const toggleTheme = (e?: React.MouseEvent | React.TouchEvent) => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';

    // 1. Immediately toggle root class and state (Instant response, zero lag)
    const root = document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vandana-theme', nextTheme);
    setThemeState(nextTheme);

    // 2. Extract precise button coordinates on screen
    let x = window.innerWidth - 45;
    let y = 35;

    if (e) {
      const rawTarget = (e.currentTarget || e.target) as HTMLElement | null;
      const buttonElem = rawTarget ? rawTarget.closest('button') || rawTarget : null;

      if (buttonElem && buttonElem.getBoundingClientRect) {
        const rect = buttonElem.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      } else if ('clientX' in e && e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
      }
    }

    const background =
      nextTheme === 'dark'
        ? 'radial-gradient(circle, rgba(9,9,11,0.5) 0%, rgba(9,9,11,0.2) 65%, transparent 100%)'
        : 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 65%, transparent 100%)';

    // 3. Launch Slower, Relaxed Luminous Pulse (Starts at Button ➔ Expands ➔ Contracts into Button)
    setReveal({ x, y, background, key: Date.now() });

    setTimeout(() => {
      setReveal(null);
    }, 980);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vandana-theme', newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}

      {/* Slower, Relaxed Luminous Pulse Wave (Starts at Button ➔ Expands ➔ Contracts into Button) */}
      {reveal && (
        <div
          key={reveal.key}
          className="theme-button-to-button-overlay"
          style={{
            left: `${reveal.x}px`,
            top: `${reveal.y}px`,
            background: reveal.background,
          }}
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
