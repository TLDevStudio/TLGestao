import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import { initSentry } from "./lib/sentry";
import { initAnalytics } from "./lib/analytics";
import { getCookieConsent } from "./lib/cookieConsent";

initSentry();

if (getCookieConsent()?.analytics) {
  initAnalytics();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);