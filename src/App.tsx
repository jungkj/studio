import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SpotifyCallback } from "./components/SpotifyCallback";
import { ToasterContextProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

// Route tracker component
const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('🎵 === ROUTE CHANGE ===');
    console.log('🎵 Current pathname:', location.pathname);
    console.log('🎵 Current search:', location.search); 
    console.log('🎵 Full location:', location);
  }, [location]);

  return null;
};

// Test callback component
const TestCallback = () => {
  console.log('🎵 === TEST CALLBACK LOADED ===');
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-8">
      <div className="bg-white p-6 rounded border">
        <h2 className="text-lg font-bold text-green-600 mb-2">Test Callback Works!</h2>
        <p className="text-sm text-gray-700">
          This confirms React Router is working properly.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          URL: {window.location.href}
        </p>
      </div>
    </div>
  );
};

// Error boundary for callback
const CallbackWrapper = () => {
  console.log('🎵 === CALLBACK WRAPPER MOUNTING ===');
  console.log('🎵 Current URL in wrapper:', window.location.href);
  
  return (
    <div>
      <SpotifyCallback />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToasterContextProvider>
      <TooltipProvider>
        <BrowserRouter>
          <RouteTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/callback" element={<CallbackWrapper />} />
            <Route path="/test-callback" element={<TestCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
    </ToasterContextProvider>
  </QueryClientProvider>
);

export default App;