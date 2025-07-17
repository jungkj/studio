"use client";

import React, { useEffect, useState } from 'react';
import { spotifyService } from '@/utils/spotifyService';

const SpotifyCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Spotify...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🎵 === CALLBACK PAGE LOADED ===');
      console.log('🎵 Current URL:', window.location.href);
      console.log('🎵 Search params:', window.location.search);
      
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const state = params.get('state');
        
        console.log('🎵 Callback params:', { code: code?.substring(0, 20) + '...', error, state });

        if (error) {
          console.error('🎵 Spotify auth error:', error);
          setStatus('error');
          setMessage(`Spotify authorization failed: ${error}`);
          return;
        }

        if (!code) {
          console.error('🎵 No authorization code received');
          setStatus('error');
          setMessage('No authorization code received from Spotify');
          return;
        }

        console.log('🎵 Starting token exchange with code:', code.substring(0, 20) + '...');
        const success = await spotifyService.instance.handleAuthCallback(code);
        
        if (success) {
          console.log('🎵 Token exchange successful!');
          setStatus('success');
          setMessage('Successfully connected to Spotify!');
          
          // Notify parent window if we're in a popup
          if (window.opener) {
            console.log('🎵 Popup detected, notifying parent window...');
            
            // Get the stored tokens to pass to parent window
            const tokenData = {
              access_token: localStorage.getItem('spotify_access_token'),
              refresh_token: localStorage.getItem('spotify_refresh_token'),
              token_expiry: localStorage.getItem('spotify_token_expiry')
            };
            
            console.log('🎵 Token data to send:', {
              hasAccessToken: !!tokenData.access_token,
              hasRefreshToken: !!tokenData.refresh_token,
              hasExpiry: !!tokenData.token_expiry,
              origin: window.location.origin
            });
            
            // Send message to parent
            window.opener.postMessage({ 
              type: 'SPOTIFY_AUTH_SUCCESS',
              tokenData: tokenData
            }, window.location.origin);
            
            console.log('🎵 Message sent to parent, closing popup in 2 seconds...');
            setTimeout(() => {
              console.log('🎵 Closing popup now');
              window.close();
            }, 2000);
          } else {
            console.log('🎵 No popup detected, redirecting to home...');
            // Redirect back to main app
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          }
        } else {
          console.error('🎵 Token exchange failed!');
          setStatus('error');
          setMessage('Failed to complete Spotify authentication');
        }
      } catch (error) {
        console.error('🎵 === CALLBACK ERROR ===');
        console.error('🎵 Error details:', error);
        console.error('🎵 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
        
        // Still try to close popup after error
        if (window.opener) {
          setTimeout(() => {
            console.log('🎵 Closing popup after error');
            window.close();
          }, 3000);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-mac-light-gray flex items-center justify-center p-8">
      <div className="bg-mac-white mac-border-outset max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <h2 className="text-lg font-bold mac-system-font text-mac-black mb-2">
            Spotify Authentication
          </h2>
        </div>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="text-sm mac-system-font text-mac-dark-gray">
                {message}
              </div>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <div className="text-sm mac-system-font text-mac-black">
              {message}
            </div>
            <div className="text-xs mac-system-font text-mac-dark-gray">
              {window.opener ? 'This window will close automatically...' : 'Redirecting back to the app...'}
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-600 text-4xl mb-2">✗</div>
            <div className="text-sm mac-system-font text-mac-black">
              {message}
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-mac-medium-gray hover:bg-mac-dark-gray text-mac-black text-sm mac-border-outset transition-colors"
            >
              Return to App
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { SpotifyCallback }; 