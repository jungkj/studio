const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test essay data
const testEssay = {
  title: "Welcome to My Digital Studio",
  content: `> "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs

Welcome to my retro-inspired digital portfolio! This is a test essay to ensure the essay system is working properly.

## Why This Design?

I built this Mac OS classic interface because:
- It's memorable and unique
- It showcases technical creativity
- It's fun and interactive
- It stands out from typical portfolios

## What's Next?

Stay tuned for more essays about:
- My journey in tech
- Building in public
- Design philosophy
- Boston adventures

Feel free to explore the desktop, play some games, and check out my work!`,
  excerpt: "Welcome to my retro Mac OS-inspired portfolio. This is where I share my thoughts on design, technology, and building unique digital experiences.",
  slug: "welcome-to-my-digital-studio",
  published: true,
  featured: true,
  tags: ["Welcome", "Design", "Portfolio"],
  category: "General",
  reading_time: 1,
  word_count: 150,
  published_at: new Date().toISOString(),
};

async function addTestEssay() {
  console.log('🚀 Adding test essay to Supabase...');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('\n⚠️  Note: This script requires either:');
  console.log('   1. SUPABASE_SERVICE_ROLE_KEY in your .env.local');
  console.log('   2. Or temporarily disable RLS on the essays table');
  console.log('   3. Or use the admin panel in the UI to upload essays\n');
  
  try {
    // First, check if the essay already exists
    const { data: existingEssay, error: checkError } = await supabase
      .from('essays')
      .select('id, title')
      .eq('slug', testEssay.slug)
      .single();
    
    if (existingEssay && !checkError) {
      console.log('⚠️  Essay already exists:', existingEssay.title);
      console.log('🗑️  Deleting existing essay...');
      
      const { error: deleteError } = await supabase
        .from('essays')
        .delete()
        .eq('id', existingEssay.id);
      
      if (deleteError) {
        console.error('❌ Error deleting existing essay:', deleteError);
        return;
      }
    }
    
    // Insert the test essay
    const { data, error } = await supabase
      .from('essays')
      .insert([testEssay])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error inserting essay:', error);
      console.error('Details:', error.message, error.details, error.hint);
    } else {
      console.log('✅ Successfully created test essay!');
      console.log('📝 Essay details:', {
        id: data.id,
        title: data.title,
        slug: data.slug,
        published: data.published,
        created_at: data.created_at
      });
    }
    
    // Verify the essay was created
    const { data: allEssays, error: listError } = await supabase
      .from('essays')
      .select('id, title, published')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!listError && allEssays) {
      console.log('\n📚 Current published essays in database:');
      allEssays.forEach((essay, index) => {
        console.log(`${index + 1}. ${essay.title} (ID: ${essay.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
addTestEssay()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });