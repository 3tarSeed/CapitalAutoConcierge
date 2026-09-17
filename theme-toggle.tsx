"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const order = ["light", "dark", "system"] as const;
const icons = { light: Sun, dark: Moon, system: Monitor };
const labels = { light: "Light", dark: "Dark", system: "System" };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <button className="theme-toggle" aria-hidden />; // avoid hydration mismatch

  const current = (order.includes(theme as never) ? theme : "system") as (typeof order)[number];
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = icons[current];

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${labels[current]}. Switch to ${labels[next]}.`}
      title={`Theme: ${labels[current]}`}
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}
