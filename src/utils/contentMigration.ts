import { Essay } from './essayStorage';

/**
 * Converts plain text content to HTML format
 * This handles basic formatting like line breaks, quotes, and simple styling
 */
export const convertPlainTextToHTML = (plainText: string): string => {
  if (!plainText || plainText.trim() === '') {
    return '<p></p>';
  }

  // Check if content already contains HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(plainText);
  if (hasHtmlTags) {
    return plainText; // Already HTML, return as-is
  }

  let html = plainText;

  // Convert multiple line breaks to paragraph breaks
  html = html
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim()) {
        // Handle quotes (lines starting with >)
        if (paragraph.trim().startsWith('>')) {
          const quoteContent = paragraph.replace(/^>\s*/, '').trim();
          return `<blockquote class="border-l-4 border-gray-300 pl-4 italic">${quoteContent}</blockquote>`;
        }
        
        // Handle simple lists (lines starting with - or *)
        if (paragraph.includes('\n-') || paragraph.includes('\n*')) {
          const lines = paragraph.split('\n');
          let listItems = '';
          let inList = false;
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
              if (!inList) {
                listItems += '<ul>';
                inList = true;
              }
              listItems += `<li>${trimmed.substring(1).trim()}</li>`;
            } else if (trimmed && inList) {
              listItems += '</ul>';
              listItems += `<p>${trimmed}</p>`;
              inList = false;
            } else if (trimmed && !inList) {
              listItems += `<p>${trimmed}</p>`;
            }
          });
          
          if (inList) {
            listItems += '</ul>';
          }
          
          return listItems;
        }
        
        // Handle simple numbered lists
        if (/^\d+\.\s/.test(paragraph.trim())) {
          const lines = paragraph.split('\n');
          let listItems = '<ol>';
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (/^\d+\.\s/.test(trimmed)) {
              listItems += `<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`;
            }
          });
          
          listItems += '</ol>';
          return listItems;
        }
        
        // Regular paragraph - convert single line breaks to <br> tags
        const paragraphContent = paragraph.replace(/\n/g, '<br>');
        return `<p>${paragraphContent}</p>`;
      }
      return '';
    })
    .filter(p => p.trim() !== '')
    .join('\n');

  // Handle emphasis patterns (basic markdown-like conversion)
  html = html
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`(.*?)`/g, '<code>$1</code>');

  return html || '<p></p>';
};

/**
 * Migrates a single essay from plain text to HTML format
 */
export const migrateEssayContent = (essay: Essay): Essay => {
  return {
    ...essay,
    content: convertPlainTextToHTML(essay.content)
  };
};

/**
 * Migrates multiple essays from plain text to HTML format
 */
export const migrateEssaysContent = (essays: Essay[]): Essay[] => {
  return essays.map(migrateEssayContent);
};

/**
 * Checks if an essay needs content migration (i.e., if it's plain text)
 */
export const needsMigration = (essay: Essay): boolean => {
  const hasHtmlTags = /<[^>]*>/g.test(essay.content);
  return !hasHtmlTags && essay.content.trim() !== '';
};

/**
 * Gets essays that need migration
 */
export const getEssaysNeedingMigration = (essays: Essay[]): Essay[] => {
  return essays.filter(needsMigration);
}; 