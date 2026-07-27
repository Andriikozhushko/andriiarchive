import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "../../../src/i18n";
import SceneRouter from "./scenes";
// The app's own stylesheet — defines the parchment theme, Tailwind layers and
// every component class the real components rely on.
import "../../../src/styles/globals.css";

// Preset local state BEFORE first render: <App/> initialises showOnboarding and
// the language from localStorage in its useState initialisers, so these must be
// in place before mount (a useEffect would be too late).
try {
  localStorage.setItem("andrii.onboarded", "1");
  localStorage.setItem("andrii.lang", "en");
} catch { /* ignore */ }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <SceneRouter />
    </I18nProvider>
  </StrictMode>,
);
