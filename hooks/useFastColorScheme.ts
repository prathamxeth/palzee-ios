import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';

/**
 * Returns the current device color scheme with 0ms INSTANT real-time updates
 * combining React Native useColorScheme() hook with direct Appearance listeners.
 */
export function useFastColorScheme(): 'dark' | 'light' {
  const nativeHookScheme = useColorScheme();
  const [scheme, setScheme] = useState<'dark' | 'light'>(() => {
    const current = nativeHookScheme || Appearance.getColorScheme();
    return current === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (nativeHookScheme) {
      setScheme(nativeHookScheme === 'dark' ? 'dark' : 'light');
    }
  }, [nativeHookScheme]);

  useEffect(() => {
    const update = (next: ColorSchemeName) => {
      const active = next === 'dark' ? 'dark' : 'light';
      setScheme((prev) => (prev !== active ? active : prev));
    };

    // 1. Instant Native Appearance Event Listener
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      update(colorScheme);
    });

    // 2. Fast 50ms poller for modals / sheets on iOS
    const interval = setInterval(() => {
      update(Appearance.getColorScheme());
    }, 50);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return (nativeHookScheme ?? scheme) === 'dark' ? 'dark' : 'light';
}
