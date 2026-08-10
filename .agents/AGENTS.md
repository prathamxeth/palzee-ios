# Palzee iOS Agent Guidelines

## iOS Expo UI Architecture & Design Guidelines (inspired by `SchroederNathan/expo-ui-examples`)

All iOS components, screens, navigations, buttons, forms, and visual effects in Palzee MUST follow Expo UI native guidelines:

1. **Native iOS UI Primitives (`@expo/ui`)**:
   - Use platform-native primitives (`Host`, `Form`, `List`, `ListItem`, `FieldGroup`, `Section`, `Picker`) for settings, forms, and structured lists.
   - Maintain native iOS typography (System SF Pro, SF Mono for codes/prompts, Unpack for brand headers).

2. **Apple SF Symbols (`expo-symbols`)**:
   - Use SF Symbols (`expo-symbols` / `systemName`) for all system actions, navigation icons, flash controls, and action buttons.

3. **Liquid Glass & Blur Effects (`expo-blur`)**:
   - Use translucent frosted glass backdrops (`BlurView`), specular border highlight rings (`#FFFFFF` @ 0.45 opacity), and dynamic theme glows for floating capsules, modals, and tab bars.

4. **Expo Router Native Navigation**:
   - Align screen transitions, modal presentations, and header bars with Expo Router native iOS stack and tab navigation specifications.
