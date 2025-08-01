-- Create spotify_tokens table
CREATE TABLE IF NOT EXISTS spotify_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to manage their own tokens
CREATE POLICY "Users can manage their own Spotify tokens" ON spotify_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Allow public read access to get refresh tokens (for showing Now Playing to all visitors)
CREATE POLICY "Public can read Spotify tokens" ON spotify_tokens
  FOR SELECT USING (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_spotify_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_spotify_tokens_updated_at
  BEFORE UPDATE ON spotify_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_spotify_tokens_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_spotify_tokens_user_id ON spotify_tokens(user_id);