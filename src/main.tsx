import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { setupGlobalLocale } from "@/config/locale";

import "./styles/prime-react.css";

setupGlobalLocale();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Eliminamos StrictMode para evitar cancelaciones automáticas de peticiones en el primer render
root.render(<App />);
