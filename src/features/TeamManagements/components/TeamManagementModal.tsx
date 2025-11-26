import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast'; 
import type { Team, TeamPayload } from '../utils/types'; 

const VALID_PAGES = [
    "dashboard",
    "knowledge-base",
    "document-management",
    "public-service",
    "validation-history",
    "guide",
    "user-management",
    "team-management",
    "role-management",
    "helpdesk",
];

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: TeamPayload, id?: number) => void; 
  team: Team | null;
  isLoading: boolean;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose, onSave, team, isLoading }) => {
  const [name, setName] = useState('');
  const [pages, setPages] = useState<Set<string>>(new Set());
  const isEditMode = !!team;

  useEffect(() => {
    if (isOpen) {
      setName(team?.name || '');
      setPages(new Set(team?.pages || []));
    }
  }, [isOpen, team]);

  const handleCheckboxChange = (page: string) => {
    setPages(prev => {
      const newPages = new Set(prev);
      if (newPages.has(page)) {
        newPages.delete(page);
      } else {
        newPages.add(page);
      }
      return newPages;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (name.trim().toLowerCase() === 'default') {
      toast.error("Cannot use restricted name 'Default'.");
      return;
    }
    

    onSave({ name, pages: Array.from(pages) }, team?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Team' : 'Create New Team'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Team Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Access Rights (Pages)</label>
            <div className="mt-2 grid grid-cols-2 gap-2 border p-3 rounded-md max-h-48 overflow-y-auto">
              {VALID_PAGES.map(page => (
                <label key={page} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pages.has(page)}
                    onChange={() => handleCheckboxChange(page)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 capitalize">{page.replace(/-/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center">
              {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamManagementModal;