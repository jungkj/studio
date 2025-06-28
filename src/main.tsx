import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import React from "react"; // Import React for StrictMode

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);