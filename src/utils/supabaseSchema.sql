-- Supabase Database Schema for Azure Mongoose Wiggle
-- Run this in Supabase SQL Editor to create tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    github_username TEXT,
    linkedin_url TEXT,
    twitter_handle TEXT,
    location TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    technology_stack TEXT[],
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    status project_status DEFAULT 'draft',
    priority priority_level DEFAULT 'medium',
    tags TEXT[],
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug TEXT NOT NULL UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    category TEXT,
    reading_time INTEGER,
    word_count INTEGER,
    image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    essay_id UUID REFERENCES essays(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_website TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT comments_check CHECK (
        (essay_id IS NOT NULL AND project_id IS NULL) OR
        (essay_id IS NULL AND project_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);
CREATE INDEX IF NOT EXISTS idx_essays_published ON essays(published);
CREATE INDEX IF NOT EXISTS idx_essays_slug ON essays(slug);
CREATE INDEX IF NOT EXISTS idx_essays_created_at ON essays(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_essays_published_at ON essays(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_essays_tags ON essays USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_comments_essay_id ON comments(essay_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(is_approved);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_essays_updated_at BEFORE UPDATE ON essays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(title, '[^\w\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_time INTEGER;
BEGIN
    -- Count words (approximately)
    word_count := array_length(string_to_array(content, ' '), 1);
    
    -- Calculate reading time (assuming 200 words per minute)
    reading_time := CEIL(word_count::FLOAT / 200.0);
    
    -- Minimum 1 minute
    RETURN GREATEST(reading_time, 1);
END;
$$ LANGUAGE plpgsql;

-- Create function to update essay metadata
CREATE OR REPLACE FUNCTION update_essay_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
    END IF;
    
    -- Calculate word count
    NEW.word_count := array_length(string_to_array(NEW.content, ' '), 1);
    
    -- Calculate reading time
    NEW.reading_time := calculate_reading_time(NEW.content);
    
    -- Set published_at when published
    IF NEW.published = TRUE AND OLD.published = FALSE THEN
        NEW.published_at := TIMEZONE('utc'::text, NOW());
    ELSIF NEW.published = FALSE THEN
        NEW.published_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for essay metadata updates
CREATE TRIGGER update_essay_metadata_trigger
    BEFORE INSERT OR UPDATE ON essays
    FOR EACH ROW EXECUTE FUNCTION update_essay_metadata();

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Essays policies
CREATE POLICY "Published essays are viewable by everyone" ON essays FOR SELECT USING (published = true OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert essays" ON essays FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own essays" ON essays FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own essays" ON essays FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (author_email = auth.email());

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Insert default categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
    ('Technology', 'technology', 'Posts about programming, software development, and tech trends', '#3B82F6', 'Code', 1),
    ('Personal', 'personal', 'Personal thoughts, experiences, and reflections', '#10B981', 'User', 2),
    ('Projects', 'projects', 'Project showcases and development stories', '#8B5CF6', 'Folder', 3),
    ('Tutorials', 'tutorials', 'Step-by-step guides and how-to articles', '#F59E0B', 'BookOpen', 4),
    ('Thoughts', 'thoughts', 'Random thoughts and philosophical musings', '#EF4444', 'Brain', 5)
ON CONFLICT (slug) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 