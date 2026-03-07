"use client";

import { useCallback, useEffect, useState } from "react";
import {
  A11yPreferences,
  DEFAULT_A11Y,
  FONT_SIZE_MAP,
} from "@/lib/accessibility";

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPreferences>(DEFAULT_A11Y);

  useEffect(() => {
    const saved = localStorage.getItem("hdim-a11y");
    if (saved) {
      try {
        setPrefs({ ...DEFAULT_A11Y, ...JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hdim-a11y", JSON.stringify(prefs));
    document.documentElement.style.fontSize = FONT_SIZE_MAP[prefs.fontSize];
    document.documentElement.classList.toggle("high-contrast", prefs.highContrast);
    document.documentElement.classList.toggle("reduce-motion", prefs.reducedMotion);
  }, [prefs]);

  const update = useCallback(
    (partial: Partial<A11yPreferences>) =>
      setPrefs((p) => ({ ...p, ...partial })),
    []
  );

  return (
    <div className="a11y-menu-wrapper">
      <button
        onClick={() => setOpen(!open)}
        className="a11y-toggle"
        aria-label="Accessibility settings"
        aria-expanded={open}
        aria-controls="a11y-panel"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="M12 7v5m0 0l-3 5m3-5l3 5M6 10h12" />
        </svg>
      </button>

      {open && (
        <div
          id="a11y-panel"
          className="a11y-panel"
          role="dialog"
          aria-label="Accessibility preferences"
        >
          <h3 className="a11y-panel-title">Accessibility</h3>

          <fieldset className="a11y-fieldset">
            <legend>Font Size</legend>
            <div className="a11y-options">
              {(["normal", "large", "x-large"] as const).map((size) => (
                <label key={size} className="a11y-radio-label">
                  <input
                    type="radio"
                    name="fontSize"
                    checked={prefs.fontSize === size}
                    onChange={() => update({ fontSize: size })}
                  />
                  <span>{size === "x-large" ? "Extra Large" : size.charAt(0).toUpperCase() + size.slice(1)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="a11y-checkbox-label">
            <input
              type="checkbox"
              checked={prefs.reducedMotion}
              onChange={(e) => update({ reducedMotion: e.target.checked })}
            />
            <span>Reduce motion</span>
          </label>

          <label className="a11y-checkbox-label">
            <input
              type="checkbox"
              checked={prefs.highContrast}
              onChange={(e) => update({ highContrast: e.target.checked })}
            />
            <span>High contrast</span>
          </label>
        </div>
      )}
    </div>
  );
}
