export interface Essay {
  id: string;
  title: string;
  date: string;
  readTime: string;
  preview: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'andy-essays';
const ADMIN_AUTH_KEY = 'andy-admin-auth';
const DELETED_ESSAYS_KEY = 'andy-essays-deleted';
const SYNCED_ESSAYS_KEY = 'andy-essays-synced';

// Default essays data
const defaultEssays: Essay[] = [
  {
    id: '1',
    title: "Why I Built a Retro Portfolio in 2025",
    date: "January 15, 2025",
    readTime: "3 min read",
    preview: "Everyone's portfolio looks the same. Same templates, same stock photos, same energy. I wanted to build something that actually represents who I am...",
    content: `Everyone's portfolio looks the same. Same Webflow templates, same stock photos from Unsplash, same corporate energy. Where's the personality? Where's the fun?

I spent my college years surrounded by people building "professional" portfolios that could have been made by anyone. They optimized for looking "serious" instead of being memorable.

Here's what I learned: Standing out matters more than fitting in.

This retro Mac site? It takes 30 seconds longer to load than a standard portfolio. But those 30 seconds create an experience. People remember experiences.

The startup world is full of people trying to be the next Steve Jobs, but they miss the point. Jobs wasn't revolutionary because he followed templates - he was revolutionary because he created new ones.

Your portfolio should be like your favorite playlist: uniquely yours and impossible to replicate.`,
    tags: ["Design", "Philosophy", "Startups"],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10
  },
  {
    id: '2',
    title: "The College Grad's Guide to Not Being Basic",
    date: "December 20, 2024", 
    readTime: "5 min read",
    preview: "Fresh out of Boston College with three majors and zero idea what I wanted to do. Here's what I learned about finding your path...",
    content: `Fresh out of Boston College with a Finance/CS/IS triple major. Sounds impressive until someone asks "so what do you want to do?"

Truth? I had no clue.

Everyone around me seemed to have it figured out. Goldman Sachs this, Google that, McKinsey everything. Meanwhile, I'm sitting here thinking "what if I just... built cool stuff?"

Here's what nobody tells you about being a new grad:
• Your first job doesn't define your career
• Passion beats prestige every time
• The best opportunities come from weird places
• Everyone else is figuring it out too

I turned down "prestigious" opportunities to work on projects that actually excited me. Best decision I ever made.

The world doesn't need another consultant. It needs people who care about building things that matter.`,
    tags: ["Career", "College", "Life"],
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 20
  },
  {
    id: '3',
    title: "Building in Public: Why I Share Everything",
    date: "November 8, 2024",
    readTime: "4 min read", 
    preview: "Transparency isn't just a buzzword - it's a superpower. Here's why I document every step of my journey...",
    content: `"Building in public" sounds like startup jargon, but it's actually revolutionary.

Most people hide their process. They only share the polished final product. But here's the thing - people connect with the journey, not the destination.

When I share my failures, my learning process, my "oh shit" moments, something magical happens: people start rooting for you.

This website? I could have launched it quietly. Instead, I documented every bug, every design decision, every moment of imposter syndrome. 

The response has been incredible. People love seeing behind the curtain.

Your struggles are your superpower. Your weird process is what makes you unique. Share it all.

The internet is full of highlight reels. Be the director's cut.`,
    tags: ["Growth", "Authenticity", "Community"],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 30
  }
];

export const essayStorage = {
  // Initialize with default essays if none exist
  init(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEssays));
    }
  },

  // Get all essays
  getAll(): Essay[] {
    if (typeof window === 'undefined' || !window.localStorage) return defaultEssays;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultEssays;
  },

  // Save essays
  saveAll(essays: Essay[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(essays));
  },

  // Add new essay
  add(essay: Omit<Essay, 'id' | 'createdAt' | 'updatedAt'>): Essay {
    const essays = this.getAll();
    const newEssay: Essay = {
      ...essay,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    essays.unshift(newEssay); // Add to beginning
    this.saveAll(essays);
    return newEssay;
  },

  // Update essay
  update(id: string, updates: Partial<Omit<Essay, 'id' | 'createdAt'>>): Essay | null {
    const essays = this.getAll();
    const index = essays.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    essays[index] = {
      ...essays[index],
      ...updates,
      updatedAt: Date.now()
    };
    this.saveAll(essays);
    return essays[index];
  },

  // Delete essay
  delete(id: string): boolean {
    const essays = this.getAll();
    const filtered = essays.filter(e => e.id !== id);
    if (filtered.length === essays.length) return false;
    
    // Track deletion if essay was previously synced
    if (this.isSynced(id)) {
      this.trackDeletion(id);
    }
    
    this.saveAll(filtered);
    return true;
  },

  // Admin authentication
  checkAdminAuth(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const auth = localStorage.getItem(ADMIN_AUTH_KEY);
    return auth === 'authenticated';
  },

  setAdminAuth(password: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    // Simple password check - in production, use proper authentication
    if (password === 'mimi123') {
      localStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
      return true;
    }
    return false;
  },

  clearAdminAuth(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(ADMIN_AUTH_KEY);
  },

  // Track deleted essays for sync
  trackDeletion(essayId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const deletedStr = localStorage.getItem(DELETED_ESSAYS_KEY);
    const deleted = deletedStr ? JSON.parse(deletedStr) : [];
    if (!deleted.includes(essayId)) {
      deleted.push(essayId);
      localStorage.setItem(DELETED_ESSAYS_KEY, JSON.stringify(deleted));
    }
  },

  // Get list of deleted essay IDs
  getDeletedEssayIds(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const deletedStr = localStorage.getItem(DELETED_ESSAYS_KEY);
    return deletedStr ? JSON.parse(deletedStr) : [];
  },

  // Clear deleted essays tracking after sync
  clearDeletedTracking(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(DELETED_ESSAYS_KEY);
  },

  // Track which essays have been synced to database
  markAsSynced(essayId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const syncedStr = localStorage.getItem(SYNCED_ESSAYS_KEY);
    const synced = syncedStr ? JSON.parse(syncedStr) : [];
    if (!synced.includes(essayId)) {
      synced.push(essayId);
      localStorage.setItem(SYNCED_ESSAYS_KEY, JSON.stringify(synced));
    }
  },

  // Check if essay has been synced
  isSynced(essayId: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const syncedStr = localStorage.getItem(SYNCED_ESSAYS_KEY);
    const synced = syncedStr ? JSON.parse(syncedStr) : [];
    return synced.includes(essayId);
  },

  // Get sync status for all essays
  getSyncStatus(): { synced: string[], unsynced: string[], deleted: string[] } {
    const allEssays = this.getAll();
    const syncedIds = JSON.parse(localStorage.getItem(SYNCED_ESSAYS_KEY) || '[]');
    const deletedIds = this.getDeletedEssayIds();
    
    const unsynced = allEssays
      .filter(essay => !syncedIds.includes(essay.id))
      .map(essay => essay.id);
    
    return {
      synced: syncedIds,
      unsynced,
      deleted: deletedIds
    };
  }
};

// Initialize on module load (only in browser)
if (typeof window !== 'undefined') {
  essayStorage.init();
} 