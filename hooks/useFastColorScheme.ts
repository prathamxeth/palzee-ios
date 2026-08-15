import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

/**
 * Returns the current device color scheme with 0ms INSTANT real-time updates
 * using direct native Appearance listeners.
 */
export function useFastColorScheme(): 'dark' | 'light' {
  const [scheme, setScheme] = useState<'dark' | 'light'>(
    () => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')
  );

  useEffect(() => {
    const update = (next: ColorSchemeName) => {
      const active = next === 'dark' ? 'dark' : 'light';
      setScheme((prev) => (prev !== active ? active : prev));
    };

    // 1. Instant Native Event Listener
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      update(colorScheme);
    });

    // 2. High-speed 200ms fallback ticker for open modals/sheets
    const interval = setInterval(() => {
      update(Appearance.getColorScheme());
    }, 200);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return scheme;
}
