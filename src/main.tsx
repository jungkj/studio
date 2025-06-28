import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"; // This is the Radix UI Toaster
import { Toaster as Sonner } from "@/components/ui/sonner"; // This is the Sonner Toaster
import React from "react"; // Import React for StrictMode
import { ToastProvider } from "@radix-ui/react-toast"; // Import ToastProvider for Radix UI

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider> {/* Radix UI ToastProvider wraps the entire application */}
      <App />
      <Toaster /> {/* This Toaster component will now only render the toasts and viewport */}
    </ToastProvider>
    <Sonner /> {/* Sonner Toaster can be a sibling to the Radix UI ToastProvider */}
  </React.StrictMode>
);