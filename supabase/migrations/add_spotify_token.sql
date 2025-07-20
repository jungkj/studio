-- Create a table to store Spotify refresh tokens
-- This allows the admin to authenticate once and all visitors can see what's playing

CREATE TABLE IF NOT EXISTS spotify_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can insert/update their own token
CREATE POLICY "Admin users can manage their own Spotify token" ON spotify_tokens
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Anyone can read the admin's token to show what's playing
CREATE POLICY "Anyone can read admin Spotify token" ON spotify_tokens
    FOR SELECT
    USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_spotify_tokens_updated_at
    BEFORE UPDATE ON spotify_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();