export interface A11yPreferences {
  fontSize: "normal" | "large" | "x-large";
  reducedMotion: boolean;
  highContrast: boolean;
}

export const DEFAULT_A11Y: A11yPreferences = {
  fontSize: "normal",
  reducedMotion: false,
  highContrast: false,
};

export const FONT_SIZE_MAP = {
  normal: "100%",
  large: "112.5%",
  "x-large": "125%",
} as const;
