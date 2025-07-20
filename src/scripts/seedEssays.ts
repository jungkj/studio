// Script to seed example essays into Supabase
// Run this script once to populate the database with example content

import { createClient } from '@supabase/supabase-js';
import type { Essay } from '@/utils/supabaseTypes';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to calculate reading time
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Example essays data
const exampleEssays = [
  {
    title: "Why I Built a Retro Portfolio in 2025",
    content: `> "The best way to predict the future is to invent it." - Alan Kay

Everyone's portfolio looks the same. Same Webflow templates, same stock photos from Unsplash, same corporate energy. Where's the personality? Where's the fun?

I spent my college years surrounded by people building "professional" portfolios that could have been made by anyone. They optimized for looking "serious" instead of being memorable.

Here's what I learned: Standing out matters more than fitting in.

This retro Mac site? It takes 30 seconds longer to load than a standard portfolio. But those 30 seconds create an experience. People remember experiences.

The startup world is full of people trying to be the next Steve Jobs, but they miss the point. Jobs wasn't revolutionary because he followed templates - he was revolutionary because he created new ones.

Your portfolio should be like your favorite playlist: uniquely yours and impossible to replicate.`,
    excerpt: "Everyone's portfolio looks the same. Same templates, same stock photos, same energy. I wanted to build something that actually represents who I am...",
    tags: ["Design", "Philosophy", "Startups"],
    category: "Tech",
    featured: true,
  },
  {
    title: "The College Grad's Guide to Not Being Basic",
    content: `> "Your time is limited, so don't waste it living someone else's life." - Steve Jobs

Fresh out of Boston College with a Finance/CS/IS triple major. Sounds impressive until someone asks "so what do you want to do?"

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
    tags: ["Career", "College", "Life"],
    category: "Life",
    featured: false,
  },
  {
    title: "Building in Public: Why I Share Everything",
    content: `> "Transparency breeds legitimacy." - Howard Schultz

"Building in public" sounds like startup jargon, but it's actually revolutionary.

Most people hide their process. They only share the polished final product. But here's the thing - people connect with the journey, not the destination.

When I share my failures, my learning process, my "oh shit" moments, something magical happens: people start rooting for you.

This website? I could have launched it quietly. Instead, I documented every bug, every design decision, every moment of imposter syndrome. 

The response has been incredible. People love seeing behind the curtain.

Your struggles are your superpower. Your weird process is what makes you unique. Share it all.

The internet is full of highlight reels. Be the director's cut.`,
    excerpt: "Transparency isn't just a buzzword - it's a superpower. Here's why I document every step of my journey...",
    tags: ["Growth", "Authenticity", "Community"],
    category: "Business",
    featured: false,
  },
  {
    title: "On Walking in Boston",
    content: `>> "All truly great thoughts are conceived while walking." - Friedrich Nietzsche

There's something about walking through Boston that clears your head in a way nothing else can. Maybe it's the mix of old and new, the cobblestones next to glass towers, or just the sheer walkability of it all.

I've solved more problems walking from Back Bay to the North End than sitting at any desk. The city becomes your thinking partner - each neighborhood shift brings a new perspective.

My favorite route: Start at the Public Garden, walk through Beacon Hill (those gas lamps hit different at dusk), cut through Government Center, and end up in the North End for cannoli. It's a 45-minute journey through 400 years of history.

Walking isn't just transportation here - it's meditation with a destination.

The best ideas come when you're not trying to have them. Boston taught me that.`,
    excerpt: "There's something about walking through Boston that clears your head in a way nothing else can. The city becomes your thinking partner...",
    tags: ["Boston", "Philosophy", "Creativity"],
    category: "Life",
    featured: true,
  },
  {
    title: "Why Everyone Should Learn to Code (But Not Everyone Should Be a Developer)",
    content: `> "Everybody should learn to program a computer, because it teaches you how to think." - Steve Jobs

Hot take: Everyone should learn to code, but that doesn't mean everyone should become a software engineer.

Coding is like learning to write - it's a tool for expressing ideas, not a career mandate. You don't need to be Hemingway to benefit from writing skills.

What coding really teaches you:
• Problem decomposition (breaking big problems into small ones)
• Logical thinking (if this, then that)
• Debugging (why isn't this working?)
• Patience (seriously, so much patience)

I've seen marketers automate reports with Python, designers prototype with JavaScript, and finance folks build models that actually make sense. They're not "developers" - they're professionals with superpowers.

The future belongs to people who can bridge the gap between human problems and technical solutions. You don't need to be on either side exclusively.

Learn to code. Build something small. Thank me later.`,
    excerpt: "Coding is like learning to write - it's a tool for expressing ideas, not a career mandate. Here's why everyone should give it a shot...",
    tags: ["Tech", "Education", "Skills"],
    category: "Tech",
    featured: false,
  }
];

async function seedEssays() {
  console.log('🌱 Starting essay seeding...');
  
  // You'll need to authenticate as an admin user first
  // For now, we'll assume you're running this while authenticated
  
  for (const essayData of exampleEssays) {
    const slug = generateSlug(essayData.title);
    const wordCount = essayData.content.split(/\s+/).length;
    const readingTime = calculateReadingTime(essayData.content);
    
    const essay = {
      title: essayData.title,
      content: essayData.content,
      excerpt: essayData.excerpt,
      slug,
      published: true,
      featured: essayData.featured,
      tags: essayData.tags,
      category: essayData.category,
      reading_time: readingTime,
      word_count: wordCount,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log(`📝 Creating essay: ${essay.title}`);
    
    const { data, error } = await supabase
      .from('essays')
      .insert([essay])
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error creating essay "${essay.title}":`, error);
    } else {
      console.log(`✅ Successfully created essay: ${data.title}`);
    }
  }
  
  console.log('🎉 Essay seeding complete!');
}

// Run the seeding function
seedEssays().catch(console.error);

// Instructions:
// 1. Make sure you're authenticated with admin privileges
// 2. Run: npx tsx src/scripts/seedEssays.ts
// Or add this to your package.json scripts:
// "seed:essays": "tsx src/scripts/seedEssays.ts"