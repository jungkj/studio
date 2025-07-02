// Real-time audio analysis utility using Web Audio API

// Extend Window interface for older browser support
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  volume: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
  peakFrequency: number;
  isPlaying: boolean;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private isInitialized = false;
  private frequencyData: Uint8Array = new Uint8Array(0);
  
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; // This gives us 128 frequency bins
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      // Initialize frequency data array
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.isInitialized = true;
      console.log('✅ AudioAnalyzer initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioAnalyzer:', error);
      return false;
    }
  }
  
  async connectToAudioElement(audioElement: HTMLAudioElement): Promise<boolean> {
    if (!this.audioContext || !this.analyser) return false;
    
    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create source from audio element if not already connected
      if (!this.source) {
        this.source = this.audioContext.createMediaElementSource(audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        console.log('✅ Connected to audio element');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect to audio element:', error);
      return false;
    }
  }
  
  getFrequencyData(): AudioAnalysisData | null {
    if (!this.analyser || !this.isInitialized) return null;
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.frequencyData);
    
    // Calculate volume (RMS of all frequencies)
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i] * this.frequencyData[i];
    }
    const volume = Math.sqrt(sum / this.frequencyData.length) / 255;
    
    // Calculate frequency band levels
    const bassEnd = Math.floor(this.frequencyData.length * 0.15); // ~0-2kHz
    const midEnd = Math.floor(this.frequencyData.length * 0.6);   // ~2-8kHz
    // Treble is from midEnd to end                                 // ~8kHz+
    
    const bassLevel = this.getAverageLevel(0, bassEnd);
    const midLevel = this.getAverageLevel(bassEnd, midEnd);
    const trebleLevel = this.getAverageLevel(midEnd, this.frequencyData.length);
    
    // Find peak frequency
    let peakIndex = 0;
    let peakValue = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      if (this.frequencyData[i] > peakValue) {
        peakValue = this.frequencyData[i];
        peakIndex = i;
      }
    }
    
    // Convert peak index to approximate frequency
    const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
    const peakFrequency = (peakIndex / this.frequencyData.length) * nyquist;
    
    return {
      frequencyData: new Uint8Array(this.frequencyData),
      volume,
      bassLevel,
      midLevel,
      trebleLevel,
      peakFrequency,
      isPlaying: volume > 0.01 // Consider playing if there's any meaningful volume
    };
  }
  
  private getAverageLevel(start: number, end: number): number {
    let sum = 0;
    const count = end - start;
    
    for (let i = start; i < end; i++) {
      sum += this.frequencyData[i];
    }
    
    return (sum / count) / 255; // Normalize to 0-1
  }
  
  disconnect(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.isInitialized = false;
    console.log('🔌 AudioAnalyzer disconnected');
  }
  
  get isReady(): boolean {
    return this.isInitialized && !!this.analyser;
  }
}

// Create a singleton instance
export const audioAnalyzer = new AudioAnalyzer(); 