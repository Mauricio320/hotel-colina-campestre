import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { setupGlobalLocale } from "@/config/locale";

import "./styles/prime-react.css";

// Registro del Service Worker de PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("SW registration failed: ", error);
    });
  });
}

setupGlobalLocale();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Eliminamos StrictMode para evitar cancelaciones automáticas de peticiones en el primer render
root.render(<App />);
