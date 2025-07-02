import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { essayStorage } from '@/utils/essayStorage';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate a slight delay for better UX
    setTimeout(() => {
      const success = essayStorage.setAdminAuth(password);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid password. Try again.');
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center p-4 bg-mac-light-gray">
      <div className="mac-border-outset bg-mac-white p-4 w-full max-w-xs">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold mb-1">Admin Access</h3>
          <div className="text-xs text-mac-dark-gray">
            Enter password to manage essays
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mac-system-font text-xs mt-1"
              placeholder="Enter admin password"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="text-xs text-red-600 mb-3 text-center">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <PixelButton 
              type="button" 
              onClick={onCancel} 
              variant="default" 
              className="text-xs px-3"
              disabled={loading}
            >
              Cancel
            </PixelButton>
            <PixelButton 
              type="submit" 
              className="text-xs px-3 apple-blue-button"
              disabled={loading || !password.trim()}
            >
              {loading ? 'Checking...' : 'Login'}
            </PixelButton>
          </div>
        </form>
        
        <div className="mt-3 text-center">
          <div className="text-xs text-mac-dark-gray">
            Hint: Try accessing with Cmd+Shift+A
          </div>
        </div>
      </div>
    </div>
  );
};

export { AdminLogin }; 