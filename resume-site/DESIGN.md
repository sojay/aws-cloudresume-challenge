---
name: Samuel Okorie Resume Site
description: Senior, reliable, terminal-native portfolio for a DevOps and cloud engineer.
colors:
  terminal: "#00D492"
  terminal-deep: "#065F46"
  command-blue: "#3B82F6"
  indigo-system: "#4F46E5"
  ink-bg: "#080A0F"
  shell-black: "#000000"
  panel-dark: "#111827"
  panel-darker: "#0F172A"
  rule-gray: "#374151"
  body-gray: "#D1D5DB"
  muted-gray: "#9CA3AF"
  paper-tint: "#F8F9FA"
typography:
  display:
    fontFamily: "Red Hat Display, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
  title:
    fontFamily: "Red Hat Display, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Red Hat Text, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  xxl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.command-blue}"
    textColor: "{colors.paper-tint}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  nav-link:
    textColor: "{colors.body-gray}"
    typography: "{typography.label}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.panel-dark}"
    textColor: "{colors.body-gray}"
    rounded: "{rounded.sm}"
    padding: "24px"
  chip:
    backgroundColor: "{colors.panel-darker}"
    textColor: "{colors.body-gray}"
    rounded: "9999px"
    padding: "4px 12px"
---

# Design System: Samuel Okorie Resume Site

## 1. Overview

**Creative North Star: "The Reliable Shell"**

This system should feel like a calm production terminal operated by someone senior enough not to show off. The atmosphere is dark, focused, and technical, but it must never become theatrical. The page should communicate infrastructure discipline: clear hierarchy, restrained accent color, readable content, and proof-first storytelling.

The current site already uses a terminal palette, fixed navigation, mono labels, and dark surfaces. Future work should refine those cues into a hiring-ready brand language. Recruiters should feel oriented quickly; engineering leaders should see enough technical specificity to trust the signal.

The system explicitly rejects a flashy hacker aesthetic, neon overload, cyberpunk drama, generic AI portfolio patterns, startup SaaS landing-page clichés, and corporate resume-template blandness.

**Key Characteristics:**
- Dark, quiet, terminal-native atmosphere.
- Green accent used as a precision signal, not decoration.
- Strong scan paths for hiring managers.
- Technical credibility carried by evidence and project detail.
- Accessible, stable, reduced-motion friendly behavior.

## 2. Colors

The palette is a restrained terminal system: near-black grounds, slate panels, one command-line green, and a supporting blue for links and actions.

### Primary
- **Terminal Signal**: The primary identity color. Use it for prompts, active states, selected details, and rare emphasis. It should stay scarce so it feels precise.
- **Command Blue**: The action and link color. Use it for links, resume download CTAs, and project exits when a stronger affordance is needed.

### Secondary
- **Indigo System**: A supporting technical accent currently present in hero and education gradients. Use lightly, or retire it where it competes with Terminal Signal.

### Neutral
- **Ink Background**: The page atmosphere. It carries the terminal mood and should be tinted rather than pure black in future OKLCH work.
- **Shell Black**: Current navigation rail background. Use only where maximum separation is needed.
- **Panel Dark** and **Panel Darker**: Card and surface layers.
- **Rule Gray**: Borders, separators, and quiet dividers.
- **Body Gray** and **Muted Gray**: Main text and secondary metadata.
- **Paper Tint**: Light text and icon color. Avoid pure white in future token work.

### Named Rules

**The One Cursor Rule.** Terminal Signal is the cursor, not the wallpaper. If more than one element per cluster is glowing green, the interface is becoming costume.

**The Blue Is Utility Rule.** Blue marks action and links. It should not become a second brand personality.

## 3. Typography

**Display Font:** Red Hat Display with sans-serif fallback  
**Body Font:** Red Hat Text with sans-serif fallback  
**Label/Mono Font:** JetBrains Mono with monospace fallback

**Character:** Red Hat Display and Red Hat Text give the resume an enterprise Linux, infrastructure-manual voice: practical, readable, and engineered. JetBrains Mono remains a narrow operational accent for prompts, metadata, and code-like labels. The pairing should feel audited and production-ready, not novelty-driven.

### Hierarchy
- **Display** (800, `clamp(3.35rem, 6vw + 1rem, 6.65rem)`, 0.96): Hero identity and major first-fold statement.
- **Section** (800, `clamp(2.35rem, 4.4vw + 1rem, 4.95rem)`, 0.96): Section headings with strong recruiter scan contrast.
- **Title** (700, `clamp(1.35rem, 1.25vw + 1rem, 1.8rem)`, 1.16): Role names, project names, capability groups, and education titles.
- **Body** (400, `1rem`, 1.72): Experience, project summaries, and supporting copy. Keep prose columns below 75ch.
- **Lede** (400, `clamp(1.0625rem, 0.5vw + 0.95rem, 1.1875rem)`, 1.62): Hero and section support copy.
- **Label** (700, `0.75rem`, uppercase, 0.105em tracking): Dates, metadata, facts, and compact system language.

### Named Rules

**The Mono Has a Job Rule.** Mono is for navigation, prompts, dates, metadata, and code. Do not use it as a lazy shorthand for everything technical.

**The Recruiter Scan Rule.** Headings and first lines must carry meaning without requiring the paragraph below.

## 4. Elevation

The system uses tonal layering, borders, and soft state shadows rather than heavy elevation. Depth should feel like a shell interface with quiet panels, not floating glass. Hover shadows may appear as a small confirmation of interactivity, but surfaces should remain stable at rest.

### Shadow Vocabulary
- **Card Hover Glow** (`0 0 0 1px rgba(0, 212, 146, 0.1), 0 4px 24px rgba(0, 0, 0, 0.4)`): Use only for interactive cards or links that need hover feedback.
- **Navigation Rail Shadow** (`0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)`): Structural separation for fixed navigation.

### Named Rules

**The Stable Surface Rule.** Surfaces should not appear fragile or glassy. Borders and tonal contrast do most of the work.

## 5. Components

### Buttons
- **Shape:** Gently rounded rectangle (6px radius).
- **Primary:** Command Blue background, Paper Tint text, medium weight, 12px by 24px padding.
- **Hover / Focus:** Darken blue, expose a visible focus ring, and avoid scale jumps that distract from reading.
- **Secondary / Ghost:** Use transparent backgrounds with Rule Gray borders and Terminal Signal or Body Gray text.

### Chips
- **Style:** Compact rounded metadata pills with dark tonal backgrounds and muted text.
- **State:** Chips should classify technologies, not decorate every sentence. Limit palette variety inside a single project card.

### Cards / Containers
- **Corner Style:** Mostly sharp, technical corners (2px radius), with larger hero containers allowed up to 16px.
- **Background:** Panel Dark or Panel Darker over Ink Background.
- **Shadow Strategy:** Flat at rest; subtle glow only on hover or focus.
- **Border:** 1px Rule Gray or low-opacity Terminal Signal for active states.
- **Internal Padding:** 24px for standard content cards, 32px for hero panels.

### Inputs / Fields
- **Style:** No dedicated fields currently exist. Future fields should use Panel Dark backgrounds, Rule Gray borders, 6px radius, and clear focus rings.
- **Focus:** Terminal Signal ring or border shift, never a decorative glow cloud.
- **Error / Disabled:** Use clear text labels and accessible contrast. Do not rely on color alone.

### Navigation
- **Style:** Fixed dark rail on desktop, compact top bar on mobile. Nav labels use JetBrains Mono and should remain text-visible, not icon-only.
- **States:** Default Body Gray, hover Terminal Signal, focus visible ring. Active section should be clear without relying only on a hidden prompt glyph.
- **Mobile Treatment:** The menu should open as a deliberate panel, expose `aria-expanded`, close predictably, and avoid covering content awkwardly.

### Signature Component

**Terminal Section Heading:** Section headings use a prompt marker and mono uppercase label. The marker should be structural, not decorative noise. Use it consistently at section starts only.

## 6. Do's and Don'ts

### Do:
- **Do** make the first screen explain Samuel's role, seniority, and value for hiring managers.
- **Do** use Terminal Signal sparingly for prompts, focus, and active state confirmation.
- **Do** keep body copy readable with generous line height and 65 to 75ch maximum line length.
- **Do** preserve keyboard navigation, screen-reader landmarks, semantic headings, and WCAG AA contrast.
- **Do** make project cards evidence-rich, with outcomes and architecture details that support technical credibility.

### Don't:
- **Don't** use a flashy hacker aesthetic.
- **Don't** add neon overload, cyberpunk theatrics, matrix-style effects, exaggerated glitch treatments, or noisy terminal gimmicks.
- **Don't** use generic AI portfolio patterns, startup SaaS landing-page clichés, decorative gradient excess, or corporate resume-template blandness.
- **Don't** nest cards inside cards when spacing, dividers, or section rhythm can separate content.
- **Don't** make every surface glow green. If the page looks like a hacker movie prop, it failed the brand.
