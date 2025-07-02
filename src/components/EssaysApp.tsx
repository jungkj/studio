import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, Clock, Tag, BookOpen, Edit, Plus, LogIn, LogOut, User } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { essayService } from '@/utils/essayService';
import { useAuth } from '@/hooks/useAuth';
import { Essay } from '@/utils/supabaseTypes';
import { cn } from '@/lib/utils';

interface EssaysAppProps {
  onClose: () => void;
}

const EssaysApp: React.FC<EssaysAppProps> = ({ onClose }) => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'published_at' | 'title' | 'reading_time'>('published_at');
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

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    essays.forEach(essay => {
      if (essay.tags) {
        essay.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [essays]);

  // Filter and sort essays
  const filteredAndSortedEssays = useMemo(() => {
    const filtered = essays.filter(essay => {
      const matchesSearch = searchQuery === '' || 
        essay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        essay.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (essay.excerpt && essay.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag === '' || (essay.tags && essay.tags.includes(selectedTag));
      
      return matchesSearch && matchesTag;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'reading_time': {
          return (a.reading_time || 0) - (b.reading_time || 0);
        }
        case 'published_at':
        default: {
          const dateA = new Date(a.published_at || a.created_at).getTime();
          const dateB = new Date(b.published_at || b.created_at).getTime();
          return dateB - dateA;
        }
      }
    });
  }, [essays, searchQuery, selectedTag, sortBy]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setAuthError(null);

      const { error } = await handleAuthSubmit(email, password);
      if (error) {
        setAuthError(error.message);
      }
      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-mac-white mac-border-outset p-6 max-w-md w-full mx-4">
          <h2 className="text-lg font-bold text-mac-black mb-4 pixel-font">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-mac-black mb-1 pixel-font">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mac-border-inset bg-mac-white text-mac-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-mac-black mb-1 pixel-font">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mac-border-inset bg-mac-white text-mac-black"
                required
              />
            </div>
            {authError && (
              <div className="text-red-600 text-sm pixel-font">{authError}</div>
            )}
            <div className="flex gap-2">
              <PixelButton
                type="submit"
                disabled={isSubmitting}
                className="bg-mac-medium-gray hover:bg-mac-dark-gray text-mac-black hover:text-mac-white"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </PixelButton>
              <PixelButton
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="bg-mac-light-gray hover:bg-mac-medium-gray text-mac-black"
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
      <div className="p-6 mac-system-font bg-mac-light-gray min-h-full">
        <div className="animate-pulse">
          <div className="text-center mb-8">
            <div className="h-8 bg-mac-medium-gray mac-border-inset w-64 mx-auto mb-3"></div>
            <div className="h-4 bg-mac-medium-gray mac-border-inset w-96 mx-auto"></div>
          </div>
          <div className="h-12 bg-mac-medium-gray mac-border-inset mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-mac-white mac-border-outset p-6 space-y-4">
                <div className="h-6 bg-mac-medium-gray mac-border-inset w-3/4"></div>
                <div className="h-4 bg-mac-medium-gray mac-border-inset w-1/2"></div>
                <div className="h-16 bg-mac-medium-gray mac-border-inset"></div>
              </div>
            ))}
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
      <div className="bg-mac-white mac-border-outset p-4 sm:p-6 border-b-2 border-mac-dark-gray">
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="bg-mac-light-gray mac-border-inset p-2 w-10 h-10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-mac-black" />
              </div>
              <h1 className="text-2xl font-bold text-mac-black pixel-font">My Essays</h1>
            </div>
            <div className="bg-mac-white mac-border-inset p-3 max-w-2xl mx-auto">
              <p className="text-sm text-mac-black pixel-font">
                Thoughts on technology, life, and everything in between.
              </p>
            </div>
          </div>
          
          {/* Auth controls */}
          <div className="ml-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <PixelButton
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    className="bg-mac-medium-gray hover:bg-mac-dark-gray text-mac-black hover:text-mac-white text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {isAdminMode ? 'Exit Admin' : 'Admin'}
                  </PixelButton>
                )}
                <PixelButton
                  onClick={handleSignOut}
                  className="bg-mac-light-gray hover:bg-mac-medium-gray text-mac-black text-sm"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </PixelButton>
              </div>
            ) : (
              <PixelButton
                onClick={() => setShowAuthModal(true)}
                className="bg-mac-light-gray hover:bg-mac-medium-gray text-mac-black text-sm"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </PixelButton>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search essays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 mac-border-inset bg-mac-white text-sm mac-system-font text-mac-black focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mac-dark-gray" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 mac-border-inset bg-mac-white min-w-[140px] w-full sm:w-auto text-sm mac-system-font text-mac-black focus:outline-none"
            >
              <option value="">All Topics</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mac-dark-gray pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'published_at' | 'title' | 'reading_time')}
              className="appearance-none pl-10 pr-8 py-2 mac-border-inset bg-mac-white min-w-[120px] w-full sm:w-auto text-sm mac-system-font text-mac-black focus:outline-none"
            >
              <option value="published_at">Latest</option>
              <option value="title">A-Z</option>
              <option value="reading_time">Quick Read</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mac-dark-gray pointer-events-none" />
          </div>
        </div>

        <div className="mt-4 bg-mac-light-gray mac-border-inset p-2 text-center">
          <span className="text-sm text-mac-black pixel-font">
            {filteredAndSortedEssays.length} essay{filteredAndSortedEssays.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedTag && ` in "${selectedTag}"`}
          </span>
        </div>
      </div>

      {/* Essays content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredAndSortedEssays.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-mac-light-gray mac-border-inset w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-mac-dark-gray" />
            </div>
            <div className="bg-mac-white mac-border-outset p-6 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-mac-black mb-2 pixel-font">No essays found</h3>
              <p className="text-sm text-mac-black mb-6 pixel-font">
                {searchQuery || selectedTag 
                  ? "Try adjusting your search or filter criteria"
                  : "Essays will appear here once they're published"}
              </p>
              {(searchQuery || selectedTag) && (
                <PixelButton
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('');
                  }}
                  className="bg-mac-light-gray hover:bg-mac-medium-gray text-mac-black"
                >
                  Clear filters
                </PixelButton>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedEssays.map((essay, index) => (
              <article
                key={essay.id}
                className={cn(
                  "bg-mac-white mac-border-outset",
                  "hover:bg-mac-light-gray cursor-pointer transition-colors",
                  expandedEssay === essay.id && "bg-mac-light-gray"
                )}
                onClick={() => toggleEssayExpansion(essay.id)}
              >
                <div className="p-4 sm:p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-bold text-mac-black leading-tight flex-1 mr-4 pixel-font">
                      {essay.title}
                    </h2>
                    <div className="ml-4 flex-shrink-0">
                      <div className="bg-mac-light-gray mac-border-inset w-8 h-8 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-mac-black" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-mac-light-gray mac-border-inset p-2 mb-4">
                    <div className="flex items-center gap-4 text-sm text-mac-black flex-wrap pixel-font">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(essay.published_at || essay.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatReadingTime(essay.reading_time)}</span>
                      </div>
                    </div>
                  </div>

                  {essay.tags && essay.tags.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {essay.tags.map((tag, tagIndex) => (
                        <PixelButton
                          key={tagIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                          }}
                          className="bg-mac-light-gray hover:bg-mac-medium-gray text-mac-black text-sm px-3 py-1"
                        >
                          {tag}
                        </PixelButton>
                      ))}
                    </div>
                  )}

                  {essay.excerpt && (
                    <div className="bg-mac-white mac-border-inset p-3 mb-4">
                      <p className="text-mac-black text-sm leading-relaxed italic line-clamp-2 pixel-font">
                        {essay.excerpt}
                      </p>
                    </div>
                  )}
                </div>

                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedEssay === essay.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t-2 border-mac-dark-gray bg-mac-light-gray">
                    <div className="bg-mac-white mac-border-inset p-3 text-sm leading-relaxed text-mac-black whitespace-pre-line max-h-80 overflow-y-auto pixel-font">
                      {essay.content.substring(0, 1000)}
                      {essay.content.length > 1000 && '...'}
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-4 bg-mac-light-gray border-t-2 border-mac-dark-gray">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm text-mac-black pixel-font">
                      💭 What do you think? Let's discuss
                    </div>
                    <PixelButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEssayExpansion(essay.id);
                      }}
                      className="bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black text-sm"
                    >
                      {expandedEssay === essay.id ? 'Show less' : 'Read more'}
                    </PixelButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Coming soon section */}
        <div className="mt-12 text-center bg-mac-white mac-border-outset p-6 sm:p-8">
          <div className="bg-mac-light-gray mac-border-inset w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-mac-black" />
          </div>
          <h3 className="text-lg font-bold text-mac-black mb-2 pixel-font">More thoughts coming soon...</h3>
          <div className="bg-mac-light-gray mac-border-inset p-3 mb-4 max-w-md mx-auto">
            <p className="text-sm text-mac-black pixel-font">
              Follow along for weekly doses of unfiltered thoughts and insights
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-mac-white mac-border-outset border-t-2 border-mac-dark-gray p-3 text-center">
        <PixelButton 
          onClick={onClose} 
          className="px-8 py-2 bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black font-bold text-sm"
        >
          ← Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { EssaysApp };