import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import React from "react"; // Import React for StrictMode
import { ToastProvider } from "@radix-ui/react-toast"; // Import ToastProvider for Radix UI

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider> {/* Radix UI ToastProvider wraps only the App component */}
      <App />
    </ToastProvider>
  </React.StrictMode>
);