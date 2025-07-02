interface CursorConfig {
  cursor: string;
  hotspotX: number;
  hotspotY: number;
  fallback: string;
}

interface CursorOptions {
  hotspotX?: number;
  hotspotY?: number;
  resetOnLeave?: boolean;
}

class CursorManager {
  private cursors = new Map<string, string>();
  private currentCursor: string | null = null;
  private imageCache = new Map<string, boolean>();
  private loadingPromises = new Map<string, Promise<string>>();
  private supportsCustomCursors: boolean;

  constructor() {
    this.supportsCustomCursors = this.detectCursorSupport();
    this.preloadCursors();
  }

  // Detect if browser supports custom cursors
  private detectCursorSupport(): boolean {
    const testElement = document.createElement('div');
    testElement.style.cursor = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="), auto';
    return testElement.style.cursor.includes('url');
  }

  // Preload cursor images
  private async preloadCursors(): Promise<void> {
    const cursorPaths = {
      default: '/pointer_reg.png',
      pointer: '/pointer_click.png',
      grab: '/pointer_click.png',
      grabbing: '/pointer_click.png',
      resize: '/resizer.png'
    };

    for (const [name, path] of Object.entries(cursorPaths)) {
      try {
        await this.preloadCursor(name, path);
      } catch (error) {
        console.warn(`Failed to load cursor: ${name}`, error);
        this.cursors.set(name, 'auto');
      }
    }
  }

  // Preload individual cursor with caching
  private async preloadCursor(name: string, path: string): Promise<string> {
    if (this.imageCache.has(name)) {
      return this.cursors.get(name) || path;
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(name, true);
        this.cursors.set(name, path);
        resolve(path);
      };
      img.onerror = () => {
        console.warn(`Failed to load cursor image: ${path}`);
        this.cursors.set(name, 'auto');
        resolve('auto');
      };
      img.src = path;
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  // Set cursor with hotspot and fallback
  setCursor(element: HTMLElement | null, cursorName: string, hotspotX = 0, hotspotY = 0): void {
    if (!this.supportsCustomCursors) {
      this.setFallbackCursor(element, cursorName);
      return;
    }

    const cursorUrl = this.cursors.get(cursorName);
    if (!cursorUrl) {
      console.warn(`Cursor "${cursorName}" not found`);
      return;
    }

    const cursorValue = cursorUrl !== 'auto' 
      ? `url("${cursorUrl}") ${hotspotX} ${hotspotY}, auto`
      : 'auto';

    const targetElement = element || document.body;
    targetElement.style.cursor = cursorValue;
    this.currentCursor = cursorName;
  }

  // Set fallback cursor for unsupported browsers
  private setFallbackCursor(element: HTMLElement | null, cursorName: string): void {
    const fallbackCursors: Record<string, string> = {
      default: 'default',
      pointer: 'pointer',
      grab: 'grab',
      grabbing: 'grabbing',
      resize: 'nw-resize'
    };

    const targetElement = element || document.body;
    targetElement.style.cursor = fallbackCursors[cursorName] || 'auto';
  }

  // Reset cursor
  resetCursor(element: HTMLElement | null = null): void {
    const targetElement = element || document.body;
    targetElement.style.cursor = '';
    this.currentCursor = null;
  }

  // Get current cursor
  getCurrentCursor(): string | null {
    return this.currentCursor;
  }

  // Add cursor change event listeners
  addCursorEvents(element: HTMLElement, cursorName: string, options: CursorOptions = {}): void {
    const { 
      hotspotX = 0, 
      hotspotY = 0, 
      resetOnLeave = true 
    } = options;

    element.addEventListener('mouseenter', () => {
      this.setCursor(element, cursorName, hotspotX, hotspotY);
    });

    if (resetOnLeave) {
      element.addEventListener('mouseleave', () => {
        this.resetCursor(element);
      });
    }
  }

  // Setup global cursor defaults
  setupGlobalCursors(): void {
    // Set default cursor for body
    this.setCursor(document.body, 'default');

    // Handle interactive elements
    this.setupInteractiveElements();
  }

  // Setup cursors for interactive elements
  private setupInteractiveElements(): void {
    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.applyElementCursors(node as HTMLElement);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Apply to existing elements
    this.applyElementCursors(document.body);
  }

  // Apply cursors to specific elements
  private applyElementCursors(rootElement: HTMLElement): void {
    // Buttons and links
    const clickableElements = rootElement.querySelectorAll('button, a, [role="button"]');
    clickableElements.forEach((element) => {
      this.addCursorEvents(element as HTMLElement, 'pointer');
    });

    // Text inputs
    const textInputs = rootElement.querySelectorAll('input[type="text"], input[type="number"], textarea, [contenteditable]');
    textInputs.forEach((element) => {
      this.addCursorEvents(element as HTMLElement, 'default');
    });

    // Draggable elements
    const draggableElements = rootElement.querySelectorAll('[draggable="true"], .draggable');
    draggableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      this.addCursorEvents(htmlElement, 'grab');
      
      htmlElement.addEventListener('mousedown', () => {
        this.setCursor(htmlElement, 'grabbing');
      });
      
      htmlElement.addEventListener('mouseup', () => {
        this.setCursor(htmlElement, 'grab');
      });
    });

    // Resize handles
    const resizeElements = rootElement.querySelectorAll('.resize-handle, .cursor-resize');
    resizeElements.forEach((element) => {
      this.addCursorEvents(element as HTMLElement, 'resize', { hotspotX: 8, hotspotY: 8 });
    });
  }

  // Debug helper
  debugCursor(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element);
    console.log('Current cursor:', computedStyle.cursor);
    console.log('Element:', element);
    console.log('Applied cursor style:', element.style.cursor);
    console.log('Supports custom cursors:', this.supportsCustomCursors);
  }
}

// Create singleton instance
const cursorManager = new CursorManager();

export default cursorManager; 