import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { Textarea } from '@/components/ui/textarea'; // Using shadcn/ui Textarea

interface NotesAppProps {
  onClose: () => void;
}

const NotesApp: React.FC<NotesAppProps> = ({ onClose }) => {
  const [noteContent, setNoteContent] = useState<string>('Type your notes here...');

  return (
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">My Notes</h2>
      <div className="flex-grow mac-border-inset bg-mac-light-gray p-3 flex flex-col">
        <Textarea
          className="flex-grow resize-none bg-mac-light-gray text-mac-black border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Start typing your notes..."
        />
      </div>
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Close Notes</PixelButton>
      </div>
    </div>
  );
};

export { NotesApp };