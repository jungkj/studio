# Browser Audio Capture Capabilities Research (2025)

## Overview
This document provides a comprehensive overview of current browser capabilities for capturing system audio or tab audio for visualization purposes, including implementation details, browser compatibility, and alternative approaches.

## 1. MediaDevices.getDisplayMedia() - System Audio Capture

### Overview
The `MediaDevices.getDisplayMedia()` method allows users to capture their display or parts thereof as a MediaStream. It can include audio tracks depending on browser support and user permissions.

### Key Features (2025)
- **System Audio**: The `systemAudio` option can be set to "include" or "exclude"
- **Audio Suppression**: `suppressLocalAudioPlayback` controls whether local audio playback is suppressed
- **Display Surface Options**: Various options for what to capture (browser, window, monitor)

### Implementation Example
```javascript
async function captureScreenWithAudio() {
  try {
    const displayMediaOptions = {
      video: {
        displaySurface: "browser",
      },
      audio: {
        suppressLocalAudioPlayback: false,
      },
      preferCurrentTab: false,
      selfBrowserSurface: "exclude",
      systemAudio: "include",
      surfaceSwitching: "include",
      monitorTypeSurfaces: "include",
    };
    
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    
    // Check if audio track is available
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      console.log('Audio capture available');
      // Connect to Web Audio API for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      // Use analyser for visualization
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      function draw() {
        analyser.getByteFrequencyData(dataArray);
        // Visualization code here
        requestAnimationFrame(draw);
      }
      draw();
    } else {
      console.log('No audio tracks available');
    }
    
    return stream;
  } catch (error) {
    console.error('Error capturing display:', error);
  }
}
```

### Browser Support (2025)
- **Chrome/Edge/Opera**: ✅ Full support (Chrome 74+)
  - System audio on Windows and ChromeOS when sharing entire screen
  - Tab audio on all platforms when sharing browser tab
- **Firefox**: ❌ No audio capture support
- **Safari**: ❌ Limited getDisplayMedia support, no audio capture

### Important Limitations
1. **User Permission Required**: Must prompt user every time (cannot be persisted)
2. **User Activation Required**: Must be called from user action (e.g., button click)
3. **Security Context**: HTTPS required in production
4. **Audio Feedback**: When capturing, audio won't play locally unless explicitly reconnected

## 2. Web Audio API - Direct Audio Capture

### Current Implementation in Your App
Your app already uses Web Audio API for analyzing audio from HTML audio elements:

```javascript
// From audioAnalyzer.ts
export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  
  async connectToAudioElement(audioElement: HTMLAudioElement): Promise<boolean> {
    if (!this.audioContext || !this.analyser) return false;
    
    try {
      // Create source from audio element
      if (!this.source) {
        this.source = this.audioContext.createMediaElementSource(audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
      return true;
    } catch (error) {
      console.error('Failed to connect to audio element:', error);
      return false;
    }
  }
}
```

### Limitations
- Can only capture audio from elements within the same origin
- Cannot capture system audio or audio from other tabs/applications
- CORS restrictions apply for cross-origin audio

## 3. Chrome's tabCapture API (Extension Only)

### Overview
The `chrome.tabCapture` API is only available in Chrome extensions and allows capturing audio/video from a specific tab.

### Manifest V3 Implementation (2025)
```javascript
// manifest.json
{
  "manifest_version": 3,
  "permissions": ["tabCapture", "activeTab"],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  }
}

// background.js (service worker)
chrome.action.onClicked.addListener(async (tab) => {
  // Create offscreen document for audio processing
  const existingContexts = await chrome.runtime.getContexts({});
  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );
  
  if (!offscreenDocument) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Recording from chrome.tabCapture API',
    });
  }
  
  // Get stream ID for the tab
  chrome.tabCapture.getMediaStreamId({
    targetTabId: tab.id
  }, (streamId) => {
    // Pass streamId to offscreen document
    chrome.runtime.sendMessage({
      type: 'startCapture',
      streamId: streamId
    });
  });
});

// offscreen.js
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'startCapture') {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: message.streamId
        }
      }
    });
    
    // Process audio stream
    processAudioStream(stream);
  }
});
```

### Key Points
- **Extension Only**: Not available in regular web apps
- **Manifest V3**: Must use offscreen documents for media processing
- **Audio Playback**: Captured audio won't play locally unless reconnected
- **Multiple Tabs**: Can capture multiple tabs simultaneously

## 4. Screen Recording with Audio

### Using getDisplayMedia for Screen + Audio
```javascript
async function recordScreenWithAudio() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      systemAudio: "include"
    }
  });
  
  // Add microphone audio if needed
  try {
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    
    // Combine streams
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    
    // Add system audio
    if (stream.getAudioTracks().length > 0) {
      const systemSource = audioContext.createMediaStreamSource(stream);
      systemSource.connect(dest);
    }
    
    // Add microphone
    const micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(dest);
    
    // Create combined stream
    const combinedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);
    
    return combinedStream;
  } catch (error) {
    // Microphone not available, use screen stream only
    return stream;
  }
}
```

## 5. Alternative Approaches (Legal & Technical)

### A. Browser Extensions (2025)
Popular extensions that users can install:
- **Chrome Audio Capture**: Records audio from any Chrome tab
- **Movavi Screen Recorder**: Captures screen and audio
- **Loom**: Records screen with internal audio support

### B. Web-Based Solutions
1. **Spotify Web API Integration** (Current approach in your app)
   - Legal and officially supported
   - Provides metadata and limited playback control
   - 30-second preview clips available

2. **WebRTC Audio Routing**
   ```javascript
   // For capturing audio from WebRTC calls
   const pc = new RTCPeerConnection();
   
   pc.ontrack = (event) => {
     if (event.track.kind === 'audio') {
       const stream = new MediaStream([event.track]);
       const audioContext = new AudioContext();
       const source = audioContext.createMediaStreamSource(stream);
       const analyser = audioContext.createAnalyser();
       source.connect(analyser);
       // Visualize audio
     }
   };
   ```

3. **Audio File Upload/URL**
   ```javascript
   // Allow users to provide audio files or URLs
   async function loadAudioFromURL(url) {
     const audio = new Audio(url);
     audio.crossOrigin = 'anonymous'; // For CORS
     await audio.play();
     
     const audioContext = new AudioContext();
     const source = audioContext.createMediaElementSource(audio);
     const analyser = audioContext.createAnalyser();
     source.connect(analyser);
     analyser.connect(audioContext.destination);
     
     return { audio, analyser };
   }
   ```

### C. Desktop Application with Web UI
Create an Electron or Tauri app that can:
- Capture system audio natively
- Expose audio data to web UI via IPC
- Provide full audio visualization capabilities

### D. Media Source Extensions (MSE)
For streaming services that use MSE:
```javascript
// Intercept MSE audio buffers
const originalAppendBuffer = SourceBuffer.prototype.appendBuffer;
SourceBuffer.prototype.appendBuffer = function(buffer) {
  // Process audio buffer for visualization
  if (this.parent.audioTracks.length > 0) {
    processAudioBuffer(buffer);
  }
  return originalAppendBuffer.call(this, buffer);
};
```

## 6. Recommendations for Your App

### Current Best Approach (Web App)
1. **Continue using Spotify Web API** for metadata and preview tracks
2. **Implement getDisplayMedia** with audio capture for Chrome users
3. **Provide fallback** visualization using simulated data for unsupported browsers

### Enhanced Implementation
```javascript
class EnhancedAudioVisualizer {
  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.captureMethod = null;
  }
  
  async startCapture() {
    // Try different capture methods in order of preference
    
    // 1. Try getDisplayMedia with audio (Chrome)
    if (navigator.mediaDevices.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: {
            systemAudio: "include",
            suppressLocalAudioPlayback: false
          }
        });
        
        if (stream.getAudioTracks().length > 0) {
          this.connectStream(stream);
          this.captureMethod = 'displayMedia';
          return true;
        }
      } catch (error) {
        console.log('getDisplayMedia audio not supported');
      }
    }
    
    // 2. Fall back to Spotify preview
    if (this.spotifyTrack?.preview_url) {
      const audio = new Audio(this.spotifyTrack.preview_url);
      this.connectAudioElement(audio);
      this.captureMethod = 'spotifyPreview';
      return true;
    }
    
    // 3. Use simulated visualization
    this.captureMethod = 'simulated';
    this.startSimulatedVisualization();
    return true;
  }
  
  connectStream(stream) {
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    // Don't connect to destination to avoid echo
  }
  
  connectAudioElement(audio) {
    const source = this.audioContext.createMediaElementSource(audio);
    source.connect(this.analyser);
    source.connect(this.audioContext.destination);
  }
}
```

### Future-Proof Considerations
1. **Monitor browser API updates** for improved audio capture support
2. **Consider Chrome extension** if system audio is critical
3. **Implement progressive enhancement** based on available APIs
4. **Provide clear user guidance** about browser limitations

## Conclusion

As of 2025, browser-based system audio capture remains limited:
- **Chrome/Edge**: Best support via getDisplayMedia
- **Firefox/Safari**: No system audio capture
- **Extensions**: Most flexible but require installation
- **Web Audio API**: Limited to same-origin audio elements

For the best user experience in your retro desktop app, combining multiple approaches (Spotify API, getDisplayMedia where available, and simulated visualizations) provides the most comprehensive solution while remaining within browser security constraints.