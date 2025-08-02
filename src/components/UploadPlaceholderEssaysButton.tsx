import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { essayAdminService } from '@/utils/essayAdminService';
import { essayStorage } from '@/utils/essayStorage';
import { useAuth } from '@/hooks/useAuth';
import { EssayInsert } from '@/utils/supabaseTypes';

const placeholderEssays: EssayInsert[] = [
  {
    title: "Why I Built a Retro Portfolio in 2025",
    content: `> "The best way to predict the future is to invent it." - Alan Kay

Everyone's portfolio looks the same. Same templates, same stock photos, same energy. I wanted to build something that actually represents who I am...

Everyone's portfolio looks the same. Same Webflow templates, same stock photos from Unsplash, same corporate energy. Where's the personality? Where's the fun?

I spent my college years surrounded by people building "professional" portfolios that could have been made by anyone. They optimized for looking "serious" instead of being memorable.

Here's what I learned: Standing out matters more than fitting in.

This retro Mac site? It takes 30 seconds longer to load than a standard portfolio. But those 30 seconds create an experience. People remember experiences.

The startup world is full of people trying to be the next Steve Jobs, but they miss the point. Jobs wasn't revolutionary because he followed templates - he was revolutionary because he created new ones.

Your portfolio should be like your favorite playlist: uniquely yours and impossible to replicate.`,
    excerpt: "Everyone's portfolio looks the same. Same templates, same stock photos, same energy. I wanted to build something that actually represents who I am...",
    slug: "why-i-built-a-retro-portfolio-in-2025",
    published: true,
    featured: false,
    tags: ["Design", "Philosophy", "Startups"],
    category: "Design",
    reading_time: 3,
    published_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    title: "The College Grad's Guide to Not Being Basic",
    content: `Fresh out of Boston College with a Finance/CS/IS triple major. Sounds impressive until someone asks "so what do you want to do?"

Truth? I had no clue.

Everyone around me seemed to have it figured out. Goldman Sachs this, Google that, McKinsey everything. Meanwhile, I'm sitting here thinking "what if I just... built cool stuff?"

Here's what nobody tells you about being a new grad:
• Your first job doesn't define your career
• Passion beats prestige every time
• The best opportunities come from weird places
• Everyone else is figuring it out too

I turned down "prestigious" opportunities to work on projects that actually excited me. Best decision I ever made.

The world doesn't need another consultant. It needs people who care about building things that matter.`,
    excerpt: "Fresh out of Boston College with three majors and zero idea what I wanted to do. Here's what I learned about finding your path...",
    slug: "the-college-grads-guide-to-not-being-basic",
    published: true,
    featured: false,
    tags: ["Career", "College", "Life"],
    category: "Career",
    reading_time: 5,
    published_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    title: "Building in Public: Why I Share Everything",
    content: `> "Transparency isn't just a buzzword - it's a superpower." 

"Building in public" sounds like startup jargon, but it's actually revolutionary.

Most people hide their process. They only share the polished final product. But here's the thing - people connect with the journey, not the destination.

When I share my failures, my learning process, my "oh shit" moments, something magical happens: people start rooting for you.

This website? I could have launched it quietly. Instead, I documented every bug, every design decision, every moment of imposter syndrome. 

The response has been incredible. People love seeing behind the curtain.

Your struggles are your superpower. Your weird process is what makes you unique. Share it all.

The internet is full of highlight reels. Be the director's cut.`,
    excerpt: "Transparency isn't just a buzzword - it's a superpower. Here's why I document every step of my journey...",
    slug: "building-in-public-why-i-share-everything",
    published: true,
    featured: false,
    tags: ["Growth", "Authenticity", "Community"],
    category: "Growth",
    reading_time: 4,
    published_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  }
];

export const UploadPlaceholderEssaysButton: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const { isAdmin } = useAuth();

  const uploadEssays = async () => {
    // Check if user is authenticated as admin locally
    const isAdminAuth = essayStorage.checkAdminAuth();
    if (!isAdminAuth) {
      setUploadStatus('❌ Admin access required - please log in with password mimi123 first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('🔄 Starting upload...');

    try {
      // Set admin authentication for the service
      essayAdminService.setAdminAuth(true);
      let successCount = 0;
      let errorCount = 0;

      for (const essay of placeholderEssays) {
        try {
          setUploadStatus(`🔄 Uploading: ${essay.title}`);
          
          const { error } = await essayAdminService.createEssayAsAdmin(essay);
          
          if (error) {
            console.error(`Error uploading essay "${essay.title}":`, error);
            errorCount++;
          } else {
            console.log(`✅ Successfully uploaded: ${essay.title}`);
            successCount++;
          }
        } catch (err) {
          console.error(`Exception uploading essay:`, err);
          errorCount++;
        }
      }

      setUploadStatus(
        `✅ Upload complete! Success: ${successCount}, Errors: ${errorCount}`
      );
      
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('❌ Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-mac-light-gray mac-border-inset">
      <h3 className="text-sm font-bold mb-2">Upload Placeholder Essays</h3>
      <p className="text-xs text-mac-dark-gray mb-3">
        Upload the 3 placeholder essays directly to Supabase.
      </p>
      <PixelButton
        onClick={uploadEssays}
        disabled={isUploading}
        className="mb-2"
      >
        {isUploading ? 'Uploading...' : 'Upload Essays'}
      </PixelButton>
      {uploadStatus && (
        <p className="text-xs mt-2">{uploadStatus}</p>
      )}
    </div>
  );
};