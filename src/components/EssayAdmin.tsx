import React, { useState } from 'react';
import { Essay, essayStorage } from '@/utils/essayStorage';
import { essayAdminService } from '@/utils/essayAdminService';
import { PixelButton } from './PixelButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload } from 'lucide-react';

interface EssayAdminProps {
  essays: Essay[];
  onEssaysChange: (essays: Essay[]) => void;
  onClose: () => void;
}

interface EssayFormData {
  title: string;
  date: string;
  readTime: string;
  preview: string;
  quote: string;
  quoteAuthor: string;
  content: string;
  tags: string;
}

const EssayAdmin: React.FC<EssayAdminProps> = ({ essays, onEssaysChange, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEssay, setEditingEssay] = useState<Essay | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EssayFormData>({
    title: '',
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    readTime: '',
    preview: '',
    quote: '',
    quoteAuthor: '',
    content: '',
    tags: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      readTime: '',
      preview: '',
      quote: '',
      quoteAuthor: '',
      content: '',
      tags: ''
    });
  };

  const handleAdd = () => {
    setEditingEssay(null);
    resetForm();
    setIsEditing(true);
  };

  const handleEdit = (essay: Essay) => {
    setEditingEssay(essay);
    
    // Extract quote from content if it starts with quote syntax
    let quote = '';
    let quoteAuthor = '';
    let content = essay.content;
    
    // Check for quote at the beginning of content
    const quoteMatch = content.match(/^>\s*"([^"]+)"(?:\s*-\s*(.+))?$/m);
    if (quoteMatch) {
      quote = quoteMatch[1];
      quoteAuthor = quoteMatch[2] || '';
      // Remove quote from content
      content = content.replace(/^>.*$/m, '').trim();
    }
    
    setFormData({
      title: essay.title,
      date: essay.date,
      readTime: essay.readTime,
      preview: essay.preview,
      quote: quote,
      quoteAuthor: quoteAuthor,
      content: content,
      tags: essay.tags.join(', ')
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required!');
      return;
    }

    // Prepare content with quote if provided
    let finalContent = formData.content;
    if (formData.quote) {
      const quoteText = formData.quoteAuthor 
        ? `> "${formData.quote}" - ${formData.quoteAuthor}`
        : `> "${formData.quote}"`;
      finalContent = `${quoteText}\n\n${formData.content}`;
    }

    const essayData = {
      title: formData.title,
      date: formData.date,
      readTime: formData.readTime,
      preview: formData.preview,
      content: finalContent,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    let updatedEssays;
    if (editingEssay) {
      // Update existing
      const updated = essayStorage.update(editingEssay.id, essayData);
      if (updated) {
        updatedEssays = essayStorage.getAll();
      } else {
        alert('Failed to update essay');
        return;
      }
    } else {
      // Add new
      essayStorage.add(essayData);
      updatedEssays = essayStorage.getAll();
    }

    onEssaysChange(updatedEssays);
    setIsEditing(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const success = essayStorage.delete(id);
    if (success) {
      const updatedEssays = essayStorage.getAll();
      onEssaysChange(updatedEssays);
    }
    setShowDeleteConfirm(null);
  };

  const handleLogout = () => {
    essayStorage.clearAdminAuth();
    onClose();
  };


  const handleUploadToSupabase = async () => {
    setIsUploading(true);
    setUploadStatus('Starting upload...');
    
    try {
      // Set admin authentication for the service
      essayAdminService.setAdminAuth(true);
      
      const localEssays = essayStorage.getAll();
      const essaysToUpload = localEssays.map(essay => ({
        title: essay.title,
        content: essay.content,
        slug: essay.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        published: true,
        excerpt: essay.preview,
        tags: essay.tags,
        category: essay.tags[0] || 'General',
        reading_time: parseInt(essay.readTime) || 5,
        published_at: new Date(essay.createdAt).toISOString(),
      }));
      
      const result = await essayAdminService.bulkUploadEssays(essaysToUpload);
      
      const message = `Upload complete! ${result.successful} essays uploaded successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}.`;
      
      if (result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
      }
      
      setUploadStatus(message);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Check console for details.');
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mac-border-inset bg-mac-light-gray p-2 mb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold">Essay Admin Panel</h3>
          <div className="flex gap-2">
            <PixelButton onClick={handleAdd} className="text-xs px-3">
              Add New
            </PixelButton>
            <PixelButton 
              onClick={handleUploadToSupabase} 
              className="text-xs px-3 flex items-center gap-1"
              disabled={isUploading}
              title="Upload essays to Supabase database"
            >
              <Upload size={12} />
              {isUploading ? 'Uploading...' : 'Upload to DB'}
            </PixelButton>
            <PixelButton onClick={handleLogout} variant="default" className="text-xs px-2">
              Logout
            </PixelButton>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className="mac-border-inset bg-cream-50 p-2 mb-2">
          <div className="text-xs text-center">{uploadStatus}</div>
        </div>
      )}


      {/* Essays List */}
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-white p-2">
        <div className="space-y-2">
          {essays.map((essay) => (
            <div key={essay.id} className="mac-border-outset bg-mac-light-gray p-2">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-grow">
                  <h4 className="text-xs font-bold mb-1">{essay.title}</h4>
                  <div className="text-xs text-mac-dark-gray">
                    {essay.date} • {essay.readTime}
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <PixelButton 
                    onClick={() => handleEdit(essay)} 
                    className="text-xs px-2 py-1"
                  >
                    Edit
                  </PixelButton>
                  <PixelButton 
                    onClick={() => setShowDeleteConfirm(essay.id)} 
                    variant="default" 
                    className="text-xs px-2 py-1"
                  >
                    Del
                  </PixelButton>
                </div>
              </div>
              <p className="text-xs text-mac-dark-gray italic">{essay.preview}</p>
              <div className="flex gap-1 mt-1">
                {essay.tags.map((tag, i) => (
                  <span key={i} className="bg-mac-dark-gray text-mac-white text-xs px-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="mac-system-font bg-mac-white max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editingEssay ? 'Edit Essay' : 'Add New Essay'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="title" className="text-xs">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mac-system-font text-xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="date" className="text-xs">Date</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mac-system-font text-xs"
                />
              </div>
              <div>
                <Label htmlFor="readTime" className="text-xs">Read Time</Label>
                <Input
                  id="readTime"
                  value={formData.readTime}
                  onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                  placeholder="e.g., 3 min read"
                  className="mac-system-font text-xs"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags" className="text-xs">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="e.g., Tech, Startups, Life"
                className="mac-system-font text-xs"
              />
            </div>
            
            <div>
              <Label htmlFor="preview" className="text-xs">Preview</Label>
              <Textarea
                id="preview"
                value={formData.preview}
                onChange={(e) => setFormData({...formData, preview: e.target.value})}
                rows={2}
                className="mac-system-font text-xs"
              />
            </div>
            
            <div className="space-y-2 p-3 bg-cream-50 mac-border-inset">
              <Label className="text-xs font-bold">Quote (Optional)</Label>
              <div>
                <Label htmlFor="quote" className="text-xs">Quote Text</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({...formData, quote: e.target.value})}
                  rows={2}
                  className="font-pixel italic text-xs"
                  placeholder="Enter an inspiring quote..."
                />
              </div>
              <div>
                <Label htmlFor="quoteAuthor" className="text-xs">Author (Optional)</Label>
                <Input
                  id="quoteAuthor"
                  value={formData.quoteAuthor}
                  onChange={(e) => setFormData({...formData, quoteAuthor: e.target.value})}
                  className="font-pixel italic text-xs"
                  placeholder="e.g., Steve Jobs"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="content" className="text-xs">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={12}
                className="mac-system-font text-xs"
              />
            </div>
          </div>
          
          <DialogFooter>
            <PixelButton onClick={() => setIsEditing(false)} variant="default" className="text-xs px-3">
              Cancel
            </PixelButton>
            <PixelButton onClick={handleSave} className="text-xs px-3 apple-blue-button">
              {editingEssay ? 'Update' : 'Create'}
            </PixelButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="mac-system-font bg-mac-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Delete Essay</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this essay? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <PixelButton onClick={() => setShowDeleteConfirm(null)} variant="default" className="text-xs px-3">
              Cancel
            </PixelButton>
            <PixelButton 
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} 
              className="text-xs px-3"
              style={{ backgroundColor: 'hsl(var(--destructive))' }}
            >
              Delete
            </PixelButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export { EssayAdmin }; 