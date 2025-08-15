'use client';

import React from 'react';
import { designTokens } from '@/utils/designTokens';

export const StyleGuide: React.FC = () => {
  return (
    <div className="h-full overflow-auto p-4 bg-mac-white">
      <h1 className="text-lg font-bold mb-6" style={{ fontFamily: designTokens.typography.fontFamily.primary }}>
        Design System Style Guide
      </h1>

      {/* Typography Section */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-mac-dark-gray" style={{ fontFamily: designTokens.typography.fontFamily.system }}>
          Typography
        </h2>
        
        <div className="space-y-4 bg-mac-light-gray p-4 mac-border-inset">
          <div>
            <span className="text-xs text-mac-dark-gray">Primary Font (Pixel):</span>
            <p style={{ fontFamily: designTokens.typography.fontFamily.primary }}>
              TT New Pixel - Used for retro gaming elements
            </p>
          </div>
          
          <div>
            <span className="text-xs text-mac-dark-gray">System Font (Monaco):</span>
            <p style={{ fontFamily: designTokens.typography.fontFamily.system }}>
              Monaco, Menlo, Courier - Used for UI and content
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-mac-dark-gray">Font Sizes:</span>
            {Object.entries(designTokens.typography.fontSize).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-4">
                <span className="text-xs text-mac-dark-gray w-12">{key}:</span>
                <span style={{ fontSize: value, fontFamily: designTokens.typography.fontFamily.system }}>
                  The quick brown fox ({value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-mac-dark-gray" style={{ fontFamily: designTokens.typography.fontFamily.system }}>
          Spacing Scale
        </h2>
        
        <div className="space-y-2 bg-mac-light-gray p-4 mac-border-inset">
          {Object.entries(designTokens.spacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-xs text-mac-dark-gray w-12">{key}:</span>
              <div 
                className="bg-mac-darker-gray mac-border-outset"
                style={{ width: value, height: '16px' }}
              />
              <span className="text-xs text-mac-dark-gray">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Colors Section */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-mac-dark-gray" style={{ fontFamily: designTokens.typography.fontFamily.system }}>
          Color Palette
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold">Mac Grays</h3>
            <div className="space-y-1">
              {['mac-white', 'mac-light-gray', 'mac-medium-gray', 'mac-darker-gray', 'mac-dark-gray', 'mac-black'].map(color => (
                <div key={color} className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-${color} mac-border-inset`} />
                  <span className="text-xs">{color}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-bold">Apple Colors</h3>
            <div className="space-y-1">
              {['apple-blue', 'apple-green', 'apple-red', 'apple-orange', 'apple-purple'].map(color => (
                <div key={color} className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-${color} mac-border-inset`} />
                  <span className="text-xs">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Window Constraints */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-mac-dark-gray" style={{ fontFamily: designTokens.typography.fontFamily.system }}>
          Window Constraints
        </h2>
        
        <div className="bg-mac-light-gray p-4 mac-border-inset">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-xs text-mac-dark-gray">Min Width:</dt>
              <dd className="text-xs font-mono">{designTokens.window.minWidth}px</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-mac-dark-gray">Min Height:</dt>
              <dd className="text-xs font-mono">{designTokens.window.minHeight}px</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-mac-dark-gray">Default Width:</dt>
              <dd className="text-xs font-mono">{designTokens.window.defaultWidth}px</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-mac-dark-gray">Default Height:</dt>
              <dd className="text-xs font-mono">{designTokens.window.defaultHeight}px</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-mac-dark-gray">Title Bar Height:</dt>
              <dd className="text-xs font-mono">{designTokens.window.titleBarHeight}px</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-mac-dark-gray" style={{ fontFamily: designTokens.typography.fontFamily.system }}>
          Usage Examples
        </h2>
        
        <div className="space-y-4 bg-mac-light-gray p-4 mac-border-inset">
          <div>
            <h3 className="text-sm font-bold mb-2">Consistent Spacing:</h3>
            <pre className="text-xs bg-mac-white p-2 mac-border-inset overflow-x-auto">
{`// Use design tokens for spacing
<div style={{ padding: designTokens.spacing[4] }}>
  <h1 style={{ marginBottom: designTokens.spacing[2] }}>Title</h1>
  <p>Content with consistent spacing</p>
</div>`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-2">Typography Usage:</h3>
            <pre className="text-xs bg-mac-white p-2 mac-border-inset overflow-x-auto">
{`// Apply consistent fonts
<h1 style={{ 
  fontFamily: designTokens.typography.fontFamily.primary,
  fontSize: designTokens.typography.fontSize.lg
}}>
  Retro Title
</h1>`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};