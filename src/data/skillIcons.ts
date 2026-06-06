// Skill icons — simplified SVG paths for each technology
// Monochrome, stroke-based, viewBox="0 0 48 48"

export interface SkillIcon {
  svg: string; // inline SVG markup
}

export const skillIcons: Record<string, SkillIcon> = {
  // --- Languages ---
  C: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L6 14.5V33.5L24 44L42 33.5V14.5L24 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M24 14C20 14 16 17 16 24C16 31 20 34 24 34C28 34 32 31 32 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 19L28 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M25 29L28 33" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 21L34 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 21L14 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  "C++": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L6 14.5V33.5L24 44L42 33.5V14.5L24 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M17 24C17 28 19 32 24 32C27 32 29 30 30 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M17 24C17 18 20 16 24 16C27 16 29 18 30 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 18V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 20H34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 26V30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 28H34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Python: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 14V28C16 30 17 31 19 31H27C29 31 31 32 31 34V40C31 42 29 44 27 44H20C17 44 16 41 16 39" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 34V20C32 18 31 17 29 17H21C19 17 17 16 17 14V8C17 6 19 4 21 4H28C31 4 32 7 32 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="19" cy="36" r="1" fill="currentColor"/>
      <circle cx="29" cy="12" r="1" fill="currentColor"/>
    </svg>`,
  },
  "Embedded C": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="28" height="32" rx="3" stroke="currentColor" stroke-width="2"/>
      <rect x="16" y="14" width="16" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M20 30L22 33L26 33L28 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 26L12 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M32 26L36 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="17" r="1" fill="currentColor"/>
    </svg>`,
  },
  Bash: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M41 24C41 33 34 41 24 41C14 41 7 33 7 24C7 15 14 7 24 7C34 7 41 15 41 24Z" stroke="currentColor" stroke-width="2"/>
      <path d="M24 14L24 24L29 29" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 18L20 20L16 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 30L28 34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  TypeScript: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
      <path d="M22 24H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 14V34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M26 34V24C26 22 27 21 28 21H32C33 21 34 22 34 24V34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 28H34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },

  // --- Tools ---
  KiCad: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="32" rx="3" stroke="currentColor" stroke-width="2"/>
      <path d="M14 28V18H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 28H20L24 22L28 28H34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="24" cy="14" r="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="34" cy="30" r="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="14" cy="32" r="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M24 18V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  Altium: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="3" stroke="currentColor" stroke-width="2"/>
      <path d="M14 16H34L24 30L14 16Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M14 32H34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14 36H24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "ESP-IDF": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="6" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M14 14L10 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M38 18L34 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 30L14 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M34 34L38 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <rect x="18" y="26" width="12" height="16" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M22 24V26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M26 24V26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="34" r="1" fill="currentColor"/>
    </svg>`,
  },
  Linux: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M15 30C15 30 18 34 24 34C30 34 33 30 33 30" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 20C20 18 22 17 24 17C26 17 28 18 28 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="18" cy="23" r="1.5" fill="currentColor"/>
      <circle cx="30" cy="23" r="1.5" fill="currentColor"/>
      <path d="M24 28V25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Git: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 10C14 7 16 5 19 5C22 5 24 7 24 10V18L30 14L36 20L30 26L24 20V28" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="19" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="19" cy="38" r="5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="36" cy="20" r="5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M19 14V33" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  LaTeX: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="6" y="36" font-family="serif" font-size="36" font-weight="bold" stroke="none" fill="currentColor">E<text x="24" y="22" font-family="serif" font-size="16" fill="currentColor" dy="-4">x</text></text>
      <path d="M24 34L36 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 34L24 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 30L40 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 32L36 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 34L32 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 10L40 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 14H28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "Fusion 360": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28L24 8L40 28L24 42L8 28Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="24" cy="25" r="6" stroke="currentColor" stroke-width="1.5"/>
      <path d="M24 8V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 31V42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8 28H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M30 28H40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="25" r="1.5" fill="currentColor"/>
    </svg>`,
  },
  VSCode: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 36L6 34V14L10 12L26 24L10 36Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M42 34L26 24L42 14V34Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10 12L26 24L42 14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10 36L26 24L42 34" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
  PlatformIO: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="2"/>
      <path d="M24 6V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 30V42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 24H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M30 24H42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="2" fill="currentColor"/>
    </svg>`,
  },

  // --- Areas ---
  IoT: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="36" r="5" stroke="currentColor" stroke-width="2"/>
      <circle cx="36" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="36" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M17 34L25 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M30 31L34 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14 31L18 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M33 37L39 37" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 40L36 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  "Embedded Systems": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="18" width="20" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 30H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M34 30H38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 35H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M34 35H38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="2" fill="currentColor"/>
      <path d="M24 6V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "PCB Design": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M14 14H34L24 24L14 14Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="14" y="24" width="8" height="14" stroke="currentColor" stroke-width="1.5"/>
      <rect x="26" y="24" width="8" height="14" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
      <circle cx="30" cy="18" r="1.5" fill="currentColor"/>
      <circle cx="18" cy="31" r="1.5" fill="currentColor"/>
      <circle cx="30" cy="31" r="1.5" fill="currentColor"/>
    </svg>`,
  },
  "Signal Processing": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 36L10 28L16 32L22 14L28 26L34 8L40 16L44 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 14L34 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="34" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M4 40H44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M4 4V40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  Automation: {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="10" width="20" height="14" rx="3" stroke="currentColor" stroke-width="2"/>
      <rect x="16" y="12" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1"/>
      <rect x="28" y="12" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1"/>
      <path d="M24 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 24V28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M12 28H36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 28C12 28 8 32 8 34C8 36 10 38 14 38H34C38 38 40 36 40 34C40 32 36 28 36 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 34H28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="34" r="1" fill="currentColor"/>
    </svg>`,
  },
  "Circuit Analysis": {
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12H14L18 6L22 18L26 6L30 14L34 6L38 12H42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 24H14L18 18L22 30L26 18L30 26L34 18L38 24H42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 36H14L18 30L22 42L26 30L30 38L34 30L38 36H42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
