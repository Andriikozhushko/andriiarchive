import { useEffect, useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useT } from "../i18n";
import type { PasswordStrengthResult } from "../types";

const SEG = ["bg-wax", "bg-amber-600", "bg-amber-500", "bg-accent", "bg-safe"];
const TXT = ["text-wax", "text-amber-700", "text-amber-700", "text-accent", "text-safe"];
const LABEL_KEYS = ["strength.veryWeak", "strength.weak", "strength.fair", "strength.strong", "strength.excellent"];
const TIME_KEYS = ["strength.timeInstant", "strength.timeMinutes", "strength.timeDays", "strength.timeMonths", "strength.timeMany"];

export default function PasswordStrength({
  password, onResult,
}: {
  password: string;
  onResult?: (r: PasswordStrengthResult | null) => void;
}) {
  const t = useT();
  const [result, setResult] = useState<PasswordStrengthResult | null>(null);
  // Responses can land out of order — only the newest request may write state.
  const reqIdRef = useRef(0);
  const aliveRef = useRef(true);

  // (re-arm on mount so a StrictMode remount doesn't leave us permanently dead)
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);

  const analyze = useCallback(async (pwd: string) => {
    const reqId = ++reqIdRef.current;
    if (!pwd) { setResult(null); onResult?.(null); return; }
    try {
      const r = await invoke<PasswordStrengthResult>("analyze_password_strength", { password: pwd });
      if (!aliveRef.current || reqId !== reqIdRef.current) return; // stale
      setResult(r);
      onResult?.(r);
    } catch { /* ignore */ }
  }, [onResult]);

  useEffect(() => {
    const id = setTimeout(() => analyze(password), 80);
    return () => clearTimeout(id);
  }, [password, analyze]);

  if (!password || !result) return null;

  const score = Math.max(0, Math.min(4, result.score));
  const strong = score >= 3;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {SEG.map((c, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? c : "bg-border"}`} />
          ))}
        </div>
        <span className={`text-[12px] font-semibold ${TXT[score]}`}>{t(LABEL_KEYS[score])}</span>
      </div>
      <p className="text-[12px] text-ink-soft leading-relaxed">
        {strong ? t("strength.strongTakes", { time: t(TIME_KEYS[score]) }) : t("strength.recommendation")}
      </p>
    </div>
  );
}
