import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Edit, LogIn, LogOut, Calendar, Clock } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { essayService } from '@/utils/essayService';
import { useAuth } from '@/hooks/useAuth';
import { Essay } from '@/utils/supabaseTypes';
import { cn } from '@/lib/utils';
import { SeedEssaysButton } from './SeedEssaysButton';

interface EssaysAppProps {
  onClose: () => void;
}

const EssaysApp: React.FC<EssaysAppProps> = ({ onClose }) => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedEssay, setExpandedEssay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth hook
  const { 
    isAuthenticated, 
    isAdmin, 
    user, 
    signInWithEmail, 
    signOut, 
    loading: authLoading 
  } = useAuth();

  // Load essays
  useEffect(() => {
    const loadEssays = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await essayService.getPublishedEssays({
          limit: 50,
          orderBy: 'published_at',
          ascending: false
        });

        if (error) {
          setError(error);
        } else {
          setEssays(data);
        }
      } catch (err) {
        setError('Failed to load essays');
        console.error('Error loading essays:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEssays();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format reading time
  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return '5 min read';
    return `${minutes} min read`;
  };

  const toggleEssayExpansion = (essayId: string) => {
    setExpandedEssay(expandedEssay === essayId ? null : essayId);
  };

  // Extract quote from content
  const extractQuote = (content: string): { quote: string | null; content: string } => {
    // Check if content starts with a quote marker (> or >>)
    const quoteRegex = /^(>>?)\s*"([^"]+)"\s*(?:-\s*(.+?))?(?:\n|$)/;
    const match = content.match(quoteRegex);
    
    if (match) {
      const quote = match[2];
      const author = match[3] || '';
      const remainingContent = content.replace(quoteRegex, '').trim();
      return {
        quote: author ? `"${quote}" - ${author}` : `"${quote}"`,
        content: remainingContent
      };
    }
    
    return { quote: null, content };
  };

  const handleAuthSubmit = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password);
    if (!error) {
      setShowAuthModal(false);
      if (isAdmin) {
        setIsAdminMode(true);
      }
    }
    return { error };
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAdminMode(false);
  };

  // Simple auth modal
  const AuthModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const { error } = await handleAuthSubmit(email, password);
      if (error) {
        setAuthError(error.message || 'Authentication failed');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-mac-white mac-border-outset p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold mb-4 text-mac-black pixel-font">Admin Sign In</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mac-border-inset bg-mac-white text-mac-black"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mac-border-inset bg-mac-white text-mac-black"
                required
              />
            </div>
            {authError && (
              <p className="text-red-600 text-sm">{authError}</p>
            )}
            <div className="flex gap-2">
              <PixelButton type="submit" className="flex-1">
                Sign In
              </PixelButton>
              <PixelButton
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="flex-1 bg-mac-medium-gray"
              >
                Cancel
              </PixelButton>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 mac-system-font bg-mac-light-gray min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <BookOpen className="w-8 h-8 text-mac-dark-gray mx-auto mb-2" />
            <p className="text-sm text-mac-dark-gray pixel-font">Loading essays...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full bg-mac-light-gray mac-system-font">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-mac-white mac-border-outset p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-mac-black mb-4 pixel-font">Connection Error</h2>
            <p className="text-mac-black mb-6 pixel-font">{error}</p>
            <PixelButton
              onClick={() => window.location.reload()}
              className="bg-mac-medium-gray hover:bg-mac-dark-gray text-mac-black hover:text-mac-white"
            >
              Retry
            </PixelButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-mac-light-gray mac-system-font">
      {showAuthModal && <AuthModal />}
      
      {/* Header */}
      <div className="bg-mac-white mac-border-inset p-4 m-4 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-mac-black" />
            <h1 className="text-lg font-bold text-mac-black pixel-font">My Essays</h1>
          </div>
          
          {/* Auth controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <PixelButton
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className="text-xs px-2 py-1"
                >
                  <Edit size={12} className="mr-1" />
                  {isAdminMode ? 'Exit' : 'Edit'}
                </PixelButton>
              )}
              <PixelButton
                onClick={handleSignOut}
                className="text-xs px-2 py-1"
              >
                <LogOut size={12} />
              </PixelButton>
            </div>
          ) : (
            <PixelButton
              onClick={() => setShowAuthModal(true)}
              className="text-xs px-2 py-1"
            >
              <LogIn size={12} />
            </PixelButton>
          )}
        </div>
        
        <p className="text-xs text-mac-dark-gray mt-2 pixel-font">
          Thoughts on technology, life, and everything in between
        </p>
        
        {/* Admin controls */}
        {isAdmin && isAdminMode && (
          <div className="mt-3 pt-3 border-t border-mac-medium-gray">
            <SeedEssaysButton />
          </div>
        )}
      </div>

      {/* Essays list */}
      <div className="flex-1 overflow-auto p-4 pt-2">
        {essays.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-mac-medium-gray mx-auto mb-4" />
            <p className="text-mac-dark-gray pixel-font">No essays yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {essays.map((essay) => {
              const { quote, content } = extractQuote(essay.content);
              return (
                <div
                  key={essay.id}
                  className={cn(
                    "bg-mac-white mac-border-outset cursor-pointer transition-all",
                    expandedEssay === essay.id && "mac-border-inset"
                  )}
                  onClick={() => toggleEssayExpansion(essay.id)}
                >
                  <div className="p-4">
                    {/* Essay header */}
                    <h2 className="text-sm font-bold text-mac-black mb-2 pixel-font">
                      {essay.title}
                    </h2>
                    
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-mac-dark-gray mb-2 pixel-font">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(essay.published_at || essay.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatReadingTime(essay.reading_time)}
                      </span>
                    </div>
                    
                    {/* Excerpt */}
                    {essay.excerpt && !expandedEssay && (
                      <p className="text-xs text-mac-dark-gray line-clamp-2 pixel-font">
                        {essay.excerpt}
                      </p>
                    )}
                  </div>
                  
                  {/* Expanded content */}
                  {expandedEssay === essay.id && (
                    <div className="px-4 pb-4 border-t border-mac-medium-gray">
                      {quote && (
                        <div className="my-3">
                          <div className="bg-cream-50 mac-border-inset p-3">
                            <p className="text-xs text-mac-dark-gray italic text-center pixel-font">
                              {quote}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="bg-mac-light-gray mac-border-inset p-3">
                        <p className="text-xs leading-relaxed text-mac-black whitespace-pre-line pixel-font">
                          {content.substring(0, 1000)}
                          {content.length > 1000 && '...'}
                        </p>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs text-mac-dark-gray pixel-font">
                          💭 Click again to collapse
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 pt-2">
        <PixelButton 
          onClick={onClose} 
          className="w-full bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white transition-colors"
        >
          ← Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { EssaysApp };