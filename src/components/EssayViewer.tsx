import React from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { Essay } from '@/utils/supabaseTypes';
import DOMPurify from 'dompurify';

interface EssayViewerProps {
  essay: Essay;
  onClose: () => void;
}

const EssayViewer: React.FC<EssayViewerProps> = ({ essay, onClose }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format reading time
  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return '5 min read';
    return `${minutes} min read`;
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

  // Helper function to safely render content (HTML or plain text)
  const renderContent = (content: string) => {
    // Check if content contains HTML tags
    const hasHtmlTags = /<[^>]*>/g.test(content);
    
    if (hasHtmlTags) {
      // Sanitize HTML content
      const sanitizedContent = DOMPurify.sanitize(content);
      
      return (
        <div 
          className="text-sm leading-relaxed text-mac-black prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      );
    } else {
      // Handle plain text content (backward compatibility)
      return (
        <div className="text-sm leading-relaxed text-mac-black whitespace-pre-line">
          {content}
        </div>
      );
    }
  };

  const { quote, content } = extractQuote(essay.content);

  return (
    <div className="flex flex-col h-full bg-mac-light-gray mac-system-font">
      {/* Header */}
      <div className="bg-mac-white mac-border-inset p-6 m-4 mb-2">
        <div className="text-center">
          <h1 className="text-xl font-bold text-mac-black mb-3">{essay.title}</h1>
          
          {/* Meta info */}
          <div className="flex items-center justify-center gap-4 text-sm text-mac-dark-gray mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(essay.published_at || essay.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatReadingTime(essay.reading_time)}
            </span>
          </div>

          {/* Excerpt */}
          {essay.excerpt && (
            <p className="text-sm text-mac-dark-gray italic mt-3">
              {essay.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pt-2">
        <div className="bg-mac-white mac-border-outset p-6">
          {/* Quote section */}
          {quote && (
            <div className="mb-6">
              <div className="bg-cream-50 mac-border-inset p-4 text-center">
                <p className="text-sm text-mac-dark-gray italic">
                  {quote}
                </p>
              </div>
              <div className="h-4 border-b border-mac-medium-gray mx-8 mt-4"></div>
            </div>
          )}
          
          {/* Main content */}
          <div className="max-w-none">
            {renderContent(content)}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 pt-2">
        <PixelButton 
          onClick={onClose} 
          className="w-full bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white transition-colors"
        >
          ← Close Essay
        </PixelButton>
      </div>
    </div>
  );
};

export { EssayViewer };