# 7. UI Design System

Uniflow's design language features a high-fidelity, premium dark theme built for readability, accessibility, and dynamic transitions. The mobile application and web portals share a unified visual identity centered on an "electric orange" brand identity.

---

## 1. Color Palette (HSL & Hex)

The color constants are defined in [Theme.ts](file:///home/emanncode/Documents/code/uniflow/uniflow-app/constants/Theme.ts).

### Backgrounds
* **Deep Canvas (`bgDeep`):** `#050505` — Pure pitch black used for layout foundations.
* **Primary Container (`bgPrimary`):** `#0a0a0b` — Deep slate gray.
* **Secondary Surface (`bgSecondary`):** `#0f1011` — Card background, list containers.
* **Tertiary Highlight (`bgTertiary`):** `#161719` — Input frames, navigation buttons, sidebar assets.
* **Glassmorphic Card (`bgCard`):** `rgba(18, 19, 21, 0.6)` — Semi-transparent panels.

### Accent & Brand Colors
* **Electric Orange (`brand` / `textBrand`):** `#ff5c1a` — The core brand color.
* **Secondary Accent (`brandSecondary`):** `#ff8c42` — Secondary action items and lighter states.
* **Action Hover (`brandHover`):** `#e64d10` — Pressed states and web hovers.
* **Subtle Highlights:**
  * `brandMuted`: `rgba(255, 92, 26, 0.1)` — Card backgrounds.
  * `brandSubtle`: `rgba(255, 92, 26, 0.05)` — Active link states.

### Status Indicators
* **Success:** `#22c55e` (Muted: `rgba(34, 197, 94, 0.08)`) — Verification flags, complete events.
* **Warning:** `#f59e0b` (Muted: `rgba(245, 158, 11, 0.08)`) — Timetable warnings, pending requests.
* **Danger:** `#ef4444` (Muted: `rgba(239, 68, 68, 0.08)`, Border: `rgba(239, 68, 68, 0.4)`) — Cancellations, error logs.
* **Info:** `#3b82f6` (Muted: `rgba(59, 130, 246, 0.08)`) — Informational cards, status labels.

---

## 2. Corner Radius System
* **Small (`sm`):** `10px` — Badges, small tag widgets, action icons.
* **Medium (`md`):** `14px` — TextInput fields, search searchbars, button components.
* **Large (`lg`):** `20px` — Timetable item cards, resource panels.
* **Extra Large (`xl`):** `32px` — Slide-over sheets, dialog modals.
* **Pill (`full`):** `9999px` — Circular profile avatars, status indicators.

---

## 3. Typography Scale

### Web Portal (Inter & Outfit)
* **Display 1:** `48px` / Line Height `56px` — Landing headers.
* **Heading 1:** `30px` / Line Height `38px` — Dashboard page titles.
* **Heading 2:** `20px` / Line Height `28px` — Card headings.
* **Body:** `14px` / Line Height `20px` — Standard records, profiles.
* **Caption:** `12px` / Line Height `16px` — Helper labels, timestamps.

### Mobile App (System Fonts & Custom Icons)
* **Title:** `24px` / Bold — Header title bar.
* **Subtitle:** `18px` / Semi-bold — Timetable day divider text.
* **Body:** `14px` / Medium — Course code, lecturer names, slots details.
* **Footnote:** `11px` / Regular — Resource files details.

---

## 4. Key UI Components

### Buttons
1. **Primary Button:** Solid `#ff5c1a` background, white text. Scales down slightly on tap (`0.97`) via Reanimated.
2. **Secondary Button:** Solid `#161719` background, thin `borderSecondary` outline, text white.
3. **Destructive Button:** Solid `#ef4444` background, white text.

### Cards
* Rendered using `bgCard` with a thin border (`borderPrimary`), subtle backdrop blur (`backdrop-filter: blur(12px)` on web), and a slight hover scale/brightness boost.

---

## 5. Animations & Motion Design

### Web Portal (`framer-motion`)
* **Page Transitions:** Route changes fade in and shift upwards:
  ```typescript
  { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }
  ```
* **Sidebar Toggle:** Smooth width transitions with spring physics.

### Mobile App (`react-native-reanimated`)
* **List Item Slide-in:** Timetable cards animate sequentially from the bottom using indexing delays:
  ```typescript
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withDelay(index * 60, withTiming(1, { duration: 250 })),
    transform: [{ translateY: withDelay(index * 60, withTiming(0, { duration: 250 })) }]
  }));
  ```
