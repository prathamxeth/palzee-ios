---
name: expo-ui-guidelines
description: iOS Expo UI design standards, native SwiftUI components, SF Symbols, Liquid Glass blur effects, and Expo Router navigation patterns based on SchroederNathan/expo-ui-examples.
---

# Expo UI Guidelines & Component Reference

Use this skill whenever creating or modifying iOS screens, components, modals, buttons, or navigation in Palzee to ensure full alignment with `SchroederNathan/expo-ui-examples`.

## Key Pillars

1. **Platform Native Primitives (`@expo/ui`)**:
   - `Host`: Cross-platform host container for native UI trees.
   - `Form` & `FieldGroup`: Native settings & modal forms with iOS rounded grouping.
   - `List` & `ListItem`: Native virtualized list rows matching SwiftUI standards.

2. **Apple SF Symbols (`expo-symbols`)**:
   - Prefer native SF Symbols for system buttons, checks, arrows, and camera controls.

3. **Liquid Glass & Backdrop Effects (`expo-blur`)**:
   - Combine `BlurView` with liquid specular borders (`#FFFFFF` @ 0.45) for floating pills, dynamic edge glows, and card containers.

4. **Fluid Navigation & Modals**:
   - Native Expo Router stack screens, sheet presentation options, and smooth tab bar pill interactions.
