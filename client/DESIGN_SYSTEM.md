# MySport Design System

## Overview
This document outlines the design system used in the MySport application. The design focuses on a professional, clean, and premium aesthetic using a refined color palette, modern typography, and glassmorphism effects.

## Typography
**Font Family:** Inter (Google Fonts)
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra Bold)

## Color Palette

### Brand Colors
- **Primary:** Indigo (`#4f46e5`) - Used for main actions, active states, and branding.
- **Secondary:** Sky (`#0ea5e9`) - Used for accents and secondary actions.
- **Accent:** Amber (`#f59e0b`) - Used for highlights and special indicators.

### Neutral Colors (Slate)
- **Background Body:** `#f8fafc` - Main background color.
- **Background Surface:** `#ffffff` - Card and container backgrounds.
- **Background Surface Alt:** `#f1f5f9` - Secondary backgrounds, hover states.
- **Text Main:** `#0f172a` - Primary text color.
- **Text Secondary:** `#475569` - Secondary text color.
- **Text Tertiary:** `#94a3b8` - Muted text, placeholders.
- **Border:** `#e2e8f0` - Borders and dividers.

### Semantic Colors
- **Success:** Emerald (`#10b981`)
- **Warning:** Amber (`#f59e0b`)
- **Danger:** Red (`#ef4444`)
- **Info:** Blue (`#3b82f6`)

## Components

### Buttons
- **Primary:** Indigo background, white text, subtle shadow.
- **Secondary:** White background, border, dark text.
- **Ghost:** Transparent background, hover effect.

### Cards
- White background, rounded corners (`12px` or `16px`), subtle border, soft shadow.
- Hover effects include slight lift (`translateY`) and increased shadow.

### Inputs
- Clean borders, focus ring with primary color shadow.
- Consistent padding and font size.

### Navigation
- Sticky header/tabs with glassmorphism effect (`backdrop-filter: blur`).
- Pill-shaped active states for tabs.

## Usage
All styles are defined in `src/index.css` using CSS variables.
Example:
```css
.my-component {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```
