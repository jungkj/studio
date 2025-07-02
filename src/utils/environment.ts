// Environment configuration for different development setups

export const getSpotifyRedirectUri = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_SPOTIFY_REDIRECT_URI) {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  }

  // Always use current origin for development to handle dynamic ports
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If hostname contains ngrok, use the current origin
    if (hostname.includes('ngrok.io') || hostname.includes('ngrok-free.app')) {
      return `${window.location.origin}/callback`;
    }
    
    // For localhost/127.0.0.1 or any local IP, always use 127.0.0.1 for consistency
    // This ensures all local addresses (localhost, 127.0.0.1, 192.168.x.x) use the same redirect URI
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      const detectedPort = port || '8080'; // fallback to 8080 if port is empty
      console.log('🎵 Detected port:', detectedPort, 'from location:', window.location.href);
      console.log('🎵 Using 127.0.0.1 for redirect URI (Spotify requirement for consistency)');
      console.log('🎵 Note: Access your site at http://127.0.0.1:' + detectedPort, 'for best Spotify compatibility');
      return `http://127.0.0.1:${detectedPort}/callback`;
    }
    
    // If we're on a custom domain, use that
    return `${window.location.origin}/callback`;
  }

  // Fallback for SSR (shouldn't be used in practice)
  return 'http://127.0.0.1:8080/callback';
};

export const getSpotifyConfig = () => {
  return {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '76f5efc0956c4fa4867ddd8f89fc1c59',
    clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '9a585cef5d3943c8909416e28a9bb88e',
    redirectUri: getSpotifyRedirectUri(),
    // User's "bruh" playlist configuration
    defaultPlaylistId: '33buJwhTwWVlKAz8wBObDL',
    defaultPlaylistUri: 'spotify:playlist:33buJwhTwWVlKAz8wBObDL',
    // Enhanced scopes for full playback control
    scopes: [
      'user-read-currently-playing',
      'user-read-playback-state',
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