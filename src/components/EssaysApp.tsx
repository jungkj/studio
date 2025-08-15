import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Calendar, Clock, RefreshCw } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { essayService } from '@/utils/essayService';
import { Essay } from '@/utils/supabaseTypes';
import { cn } from '@/lib/utils';
import { checkSupabaseConnection } from '@/utils/supabaseConfig';

interface EssaysAppProps {
  onClose: () => void;
  onOpenEssay: (essay: Essay) => void;
}

const EssaysApp: React.FC<EssaysAppProps> = ({ onClose, onOpenEssay }) => {
  const [essays, setEssays] = useState<Essay[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading essays...');


  // Load essays with retry logic
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const loadEssays = async () => {
      if (!mounted) return;

      console.log('🔍 Starting to load essays...');
      setIsLoading(true);
      setError(null);
      setLoadingMessage(retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading essays...');
      
      try {
        // Add timeout wrapper
        const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
          return Promise.race([
            promise,
            new Promise<T>((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            )
          ]);
        };

        // First check if we can connect to Supabase with timeout
        let isConnected = false;
        try {
          isConnected = await withTimeout(checkSupabaseConnection(), 5000);
          console.log('🔌 Supabase connection status:', isConnected);
        } catch (connectionError) {
          console.error('🔌 Connection check failed:', connectionError);
          throw new Error('Connection timeout - please check your internet connection');
        }
        
        if (!isConnected) {
          throw new Error('Unable to connect to database - please check Supabase configuration');
        }
        
        // Load essays with timeout
        const { data, error, count } = await withTimeout(
          essayService.getPublishedEssays({
            limit: 50,
            orderBy: 'published_at',
            ascending: false
          }),
          10000 // 10 second timeout
        );

        console.log('📚 Essays response:', { 
          dataLength: data?.length || 0, 
          totalCount: count,
          error,
          firstEssay: data?.[0]?.title
        });

        if (error) {
          console.error('❌ Error from Supabase:', error);
          throw new Error(`Database error: ${error}`);
        } else {
          console.log(`✅ Successfully loaded ${data?.length || 0} essays`);
          if (mounted) {
            setEssays(data || []);
            setIsLoading(false);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Exception loading essays:', err);
        
        // Retry logic
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          console.log(`🔄 Retrying... (${retryCount}/${maxRetries})`);
          retryTimeout = setTimeout(() => {
            if (mounted) loadEssays();
          }, retryDelay);
        } else {
          // Final error after all retries
          if (mounted) {
            setError(`Failed to load essays: ${errorMessage}. Please check your connection and try again.`);
            setIsLoading(false);
          }
        }
      }
    };

    loadEssays();

    // Cleanup function
    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  // Refresh essays
  const refreshEssays = () => {
    const loadEssays = async () => {
      console.log('🔄 Refreshing essays...');
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error, count } = await essayService.getPublishedEssays({
          limit: 50,
          orderBy: 'published_at',
          ascending: false
        });

        if (error) {
          setError(`Database error: ${error}`);
        } else {
          setEssays(data || []);
          console.log(`✅ Refreshed: ${data?.length || 0} essays`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to refresh: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEssays();
  };

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

  const handleEssayClick = (essay: Essay) => {
    onOpenEssay(essay);
  };



  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 mac-system-font bg-mac-light-gray min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <BookOpen className="w-8 h-8 text-mac-dark-gray mx-auto mb-2" />
            <p className="text-sm text-mac-dark-gray">{loadingMessage}</p>
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
            <h2 className="text-xl font-bold text-mac-black mb-4">Connection Error</h2>
            <p className="text-mac-black mb-6">{error}</p>
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
      {/* Header */}
      <div className="bg-mac-white mac-border-inset p-4 m-4 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-mac-black" />
            <h1 className="text-lg font-bold text-mac-black">My Essays</h1>
            <PixelButton
              onClick={refreshEssays}
              className="text-xs px-2 py-1"
              title="Refresh essays"
              disabled={isLoading}
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </PixelButton>
          </div>
        </div>
        
        <p className="text-xs text-mac-dark-gray mt-2">
          Thoughts on technology, life, and everything in between
        </p>
        
        <p className="text-xs text-mac-medium-gray mt-2">
          💡 Tip: Access the Settings panel and log in as admin to manage essays
        </p>
      </div>

      {/* Essays list */}
      <div className="flex-1 overflow-auto p-4 pt-2">
        {essays.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-mac-medium-gray mx-auto mb-4" />
            <p className="text-mac-dark-gray">No essays yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {essays.map((essay) => {
              return (
                <div
                  key={essay.id}
                  className="bg-mac-white mac-border-outset cursor-pointer transition-all hover:mac-border-inset"
                  onClick={() => handleEssayClick(essay)}
                >
                  <div className="p-4">
                    {/* Essay header */}
                    <h2 className="text-sm font-bold text-mac-black mb-2">
                      {essay.title}
                    </h2>
                    
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-mac-dark-gray mb-2">
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
                    {essay.excerpt && (
                      <p className="text-xs text-mac-dark-gray line-clamp-2">
                        {essay.excerpt}
                      </p>
                    )}
                    
                    {/* Click hint */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-mac-dark-gray">
                        📖 Click to open in new window
                      </span>
                    </div>
                  </div>
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