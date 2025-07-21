import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { essayStorage } from '@/utils/essayStorage';
import { essayService } from '@/utils/essayService';
import { useAuth } from '@/hooks/useAuth';

export const MigrateEssaysButton: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const { isAdmin } = useAuth();

  const migrateEssays = async () => {
    if (!isAdmin) {
      setMigrationStatus('❌ Admin access required');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('🔄 Starting migration...');

    try {
      // Get essays from local storage
      const localEssays = essayStorage.getAll();
      console.log(`Found ${localEssays.length} essays in local storage`);

      let successCount = 0;
      let errorCount = 0;

      for (const essay of localEssays) {
        try {
          setMigrationStatus(`🔄 Migrating: ${essay.title}`);
          
          // Convert local storage format to Supabase format
          const supabaseEssay = {
            title: essay.title,
            content: essay.content,
            excerpt: essay.preview,
            slug: essay.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            published: true,
            featured: false,
            tags: essay.tags,
            category: essay.tags[0] || null,
            reading_time: parseInt(essay.readTime) || 5,
            published_at: new Date(essay.createdAt).toISOString(),
          };

          const { error } = await essayService.createEssay(supabaseEssay);
          
          if (error) {
            console.error(`Error migrating essay "${essay.title}":`, error);
            errorCount++;
          } else {
            console.log(`✅ Successfully migrated: ${essay.title}`);
            successCount++;
          }
        } catch (err) {
          console.error(`Exception migrating essay:`, err);
          errorCount++;
        }
      }

      setMigrationStatus(
        `✅ Migration complete! Success: ${successCount}, Errors: ${errorCount}`
      );
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('❌ Migration failed. Check console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-4 bg-mac-light-gray mac-border-inset">
      <h3 className="text-sm font-bold mb-2">Migrate Essays to Supabase</h3>
      <p className="text-xs text-mac-dark-gray mb-3">
        This will copy all essays from local storage to Supabase database.
      </p>
      <PixelButton
        onClick={migrateEssays}
        disabled={isMigrating}
        className="mb-2"
      >
        {isMigrating ? 'Migrating...' : 'Start Migration'}
      </PixelButton>
      {migrationStatus && (
        <p className="text-xs mt-2">{migrationStatus}</p>
      )}
    </div>
  );
};