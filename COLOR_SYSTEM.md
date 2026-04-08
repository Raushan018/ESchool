# Color Standardization Guide

## Primary Color System
**Base Primary:** `#1A3A6B` (Dark Blue)

### Color Palette Generated
```
50:   #F0F3F8  (Very Light - 95% lightness)
100:  #D8E2F0  (Light - 90% lightness)
200:  #B0C6E0  (Light-Medium - 80% lightness)
300:  #87ADD0  (Medium - 70% lightness)
400:  #5E94C0  (Medium - 60% lightness)
500:  #3A7BB0  (Medium-Dark - 50% lightness)
600:  #1A3A6B  (PRIMARY - 25% lightness)
700:  #152D56  (Dark - 18% lightness)
800:  #0F2241  (Darker - 12% lightness)
900:  #0A172D  (Very Dark - 8% lightness)
950:  #051018  (Darkest - 4% lightness)
```

### Usage Guidelines

#### Light Backgrounds (UI)
- Use `50`, `100`, `200` for light backgrounds
- Use `300`, `400` for hover states on light elements

#### Text & Icons
- Use `600` (PRIMARY) for main text and icons
- Use `700` for secondary text
- Use `800`, `900` for dark text on light backgrounds
- Use `50`, `100` for text on dark backgrounds

#### Buttons & Interactive
- Default: `600` background, white text
- Hover: `700` or `800` background
- Disabled: `300` background, muted text

#### Borders & Dividers
- Use `200` for subtle borders
- Use `300` for prominent borders
- Use `400` for active/focused states

#### Gradients
- Light-to-dark: `50` → `600`
- Overlay: `600` with `0.2` opacity
- Accent: `400` → `700`

## Conversions Made
- All `brand-*` Tailwind classes → new primary color
- All `blue-*` classes → new primary color  
- All `sky-*` classes → new primary color (where blue-like usage)
- All hex/RGB colors → equivalent in new palette
