// Environment configuration for different development setups

export const getSpotifyRedirectUri = (): string => {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  }

  // Always use current origin for development to handle dynamic ports
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // For Vercel deployments
    if (hostname.includes('vercel.app') || hostname.includes('vercel.sh')) {
      // Use the specific Vercel URL
      return `https://studio-andy.vercel.app/spotifycallback`;
    }
    
    // If hostname contains ngrok, use the current origin
    if (hostname.includes('ngrok.io') || hostname.includes('ngrok-free.app')) {
      return `${window.location.origin}/spotifycallback`;
    }
    
    // For localhost/127.0.0.1 or any local IP, always use 127.0.0.1 for consistency
    // This ensures all local addresses (localhost, 127.0.0.1, 192.168.x.x) use the same redirect URI
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      const detectedPort = port || '3000'; // fallback to 3000 if port is empty
      console.log('🎵 Detected port:', detectedPort, 'from location:', window.location.href);
      console.log('🎵 Using 127.0.0.1 for redirect URI (Spotify requirement for consistency)');
      console.log('🎵 Note: Access your site at http://127.0.0.1:' + detectedPort, 'for best Spotify compatibility');
      return `http://127.0.0.1:${detectedPort}/spotifycallback`;
    }
    
    // If we're on a custom domain, use that
    return `${window.location.origin}/spotifycallback`;
  }

  // Fallback for SSR (shouldn't be used in practice)
  return 'http://127.0.0.1:3000/spotifycallback';
};

export const getSpotifyConfig = () => {
  return {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '76f5efc0956c4fa4867ddd8f89fc1c59',
    clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '9a585cef5d3943c8909416e28a9bb88e',
    redirectUri: getSpotifyRedirectUri(),
    // User's "bruh" playlist configuration
    defaultPlaylistId: '33buJwhTwWVlKAz8wBObDL',
    defaultPlaylistUri: 'spotify:playlist:33buJwhTwWVlKAz8wBObDL',
    // Enhanced scopes for full playback control
    scopes: [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-read-playback-position',
      'user-modify-playback-state',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming'
    ].join(' ')
  };
};

// Debug function to help with setup
export const logSpotifyConfig = () => {
  const config = getSpotifyConfig();
  console.log('🎵 Spotify Configuration:');
  console.log('Client ID:', config.clientId);
  console.log('Redirect URI:', config.redirectUri);
  console.log('Default Playlist:', config.defaultPlaylistId);
  console.log('Scopes:', config.scopes);
  console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
}; 