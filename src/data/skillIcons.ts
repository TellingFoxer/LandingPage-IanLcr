// Skill icons — simplified SVG paths for each technology
// Monochrome, stroke-based, viewBox="0 0 48 48"
// All icons redesigned: cleaner, symmetric, more recognizable

export interface SkillIcon {
  svg: string; // inline SVG markup
}

export const skillIcons: Record<string, SkillIcon> = {
  // --- Languages ---
  C: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 15C28 12 20 12 17 17C14 22 14 28 17 33C20 38 28 38 32 35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  "C++": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M28 16C24 13 18 13 16 17C14 21 14 27 16 31C18 35 24 35 28 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="23" x2="32" y2="29" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="29" y1="26" x2="35" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="37" y1="23" x2="37" y2="29" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="34" y1="26" x2="40" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Python: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 14C16 8 22 6 28 8C32 10 34 14 32 20C30 26 24 28 18 28L18 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 34C32 40 26 42 20 40C16 38 14 34 16 28C18 22 24 20 30 20L30 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="19" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="29" cy="38" r="1.5" fill="currentColor"/>
    </svg>`,
  },
  "Embedded C": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="24" height="24" rx="2" stroke="currentColor" stroke-width="2"/>
      <line x1="8" y1="18" x2="12" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="24" x2="12" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="30" x2="12" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="18" x2="40" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="24" x2="40" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 16C20 16 18 19 18 24C18 29 20 32 24 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Bash: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2"/>
      <path d="M14 24L18 28L14 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="22" y1="28" x2="34" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  TypeScript: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="19" y1="16" x2="19" y2="34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M31 18C31 16 36 16 36 18C36 20 29 20 29 24C29 28 38 27 38 31C38 33 34 34 32 33" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },

  // --- Tools ---
  KiCad: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/>
      <line x1="14" y1="14" x2="14" y2="34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="24" x2="34" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="24" x2="34" y2="34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Altium: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="3" stroke="currentColor" stroke-width="2"/>
      <path d="M14 34L24 14L34 34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="20" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="14" r="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="34" cy="14" r="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="14" cy="34" r="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="34" cy="34" r="2" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
  },
  "ESP-IDF": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="14" width="24" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
      <line x1="8" y1="18" x2="12" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="24" x2="12" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="30" x2="12" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="18" x2="40" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="24" x2="40" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="4" stroke="currentColor" stroke-width="1.5"/>
      <path d="M20 8C22 6 26 6 28 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="9" r="1" fill="currentColor"/>
    </svg>`,
  },
  Linux: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8C16 8 12 14 12 24V34C12 40 16 44 24 44C32 44 36 40 36 34V24C36 14 32 8 24 8Z" stroke="currentColor" stroke-width="2"/>
      <circle cx="18" cy="20" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="30" cy="20" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="18" cy="20" r="1" fill="currentColor"/>
      <circle cx="30" cy="20" r="1" fill="currentColor"/>
      <path d="M22 24L24 28L26 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 26C8 28 8 32 12 33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M36 26C40 28 40 32 36 33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  Git: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="24" x2="38" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 24L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="12" x2="38" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 24L22 36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="36" x2="38" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="24" r="2.5" stroke="currentColor" stroke-width="2"/>
      <circle cx="22" cy="24" r="2.5" fill="currentColor"/>
      <circle cx="30" cy="24" r="2.5" stroke="currentColor" stroke-width="2"/>
      <circle cx="28" cy="12" r="2.5" stroke="currentColor" stroke-width="2"/>
      <circle cx="34" cy="12" r="2.5" fill="currentColor"/>
      <circle cx="28" cy="36" r="2.5" stroke="currentColor" stroke-width="2"/>
      <circle cx="34" cy="36" r="2.5" fill="currentColor"/>
    </svg>`,
  },
  LaTeX: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  "Fusion 360": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6L40 16L24 26L8 16L24 6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M40 16V32L24 42V26" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M8 16V32L24 42V26" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
  VSCode: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 36L6 34V14L10 12L28 24L10 36Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M42 34L28 24L42 14V34Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
  PlatformIO: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/>
      <path d="M14 24C14 19.5 18.5 16 24 16C29.5 16 34 19.5 34 24C34 28.5 29.5 32 24 32C18.5 32 14 28.5 14 24Z" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(0 24 24)"/>
      <path d="M14 24C14 19.5 18.5 16 24 16C29.5 16 34 19.5 34 24C34 28.5 29.5 32 24 32C18.5 32 14 28.5 14 24Z" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(60 24 24)"/>
      <path d="M14 24C14 19.5 18.5 16 24 16C29.5 16 34 19.5 34 24C34 28.5 29.5 32 24 32C18.5 32 14 28.5 14 24Z" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(120 24 24)"/>
      <circle cx="24" cy="24" r="2" fill="currentColor"/>
    </svg>`,
  },

  // --- Areas ---
  IoT: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="34" r="5" stroke="currentColor" stroke-width="2"/>
      <circle cx="36" cy="34" r="5" stroke="currentColor" stroke-width="2"/>
      <circle cx="24" cy="14" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M24 19C20 24 16 26 14 29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 19C28 24 32 26 34 29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M17 36C20 38 28 38 31 36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "Embedded Systems": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="32" rx="3" stroke="currentColor" stroke-width="2"/>
      <rect x="16" y="16" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 14L14 14L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 14L34 14L32 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 34L14 34L16 32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 34L34 34L32 32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  "PCB Design": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M10 14L24 14L24 34L38 34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 34L24 34L24 14L38 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="14" cy="14" r="2.5" fill="currentColor"/>
      <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
      <circle cx="34" cy="34" r="2.5" fill="currentColor"/>
    </svg>`,
  },
  "Signal Processing": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 28C10 10 16 10 20 28C24 46 30 46 34 28C38 10 42 10 44 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
  },
  Automation: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="34" width="20" height="8" rx="2" stroke="currentColor" stroke-width="2"/>
      <line x1="24" y1="34" x2="24" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="24" cy="16" r="3.5" stroke="currentColor" stroke-width="2"/>
      <line x1="24" y1="16" x2="36" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="36" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <line x1="38" y1="7" x2="42" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="38" y1="13" x2="42" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "Circuit Analysis": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="24" x2="14" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 24L17 18L20 30L23 18L26 30L29 18L32 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="32" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="36" y1="16" x2="36" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="42" y1="16" x2="42" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="42" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
};

// Fallback icon for any skill not in the map
export const fallbackIcon: SkillIcon = {
  svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="28" height="28" rx="4" stroke="currentColor" stroke-width="2"/>
    <path d="M24 18V30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="24" cy="16" r="1.5" fill="currentColor"/>
  </svg>`,
};
