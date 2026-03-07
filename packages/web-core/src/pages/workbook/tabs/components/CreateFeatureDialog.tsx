import { useState } from 'react';
import type { CreateFeatureRequest } from '../types';
import { Button } from '@vibe/ui/components/Button';
import { XIcon } from '@phosphor-icons/react';

interface CreateFeatureDialogProps {
  projectId: string;
  onClose: () => void;
  onCreate: (data: CreateFeatureRequest) => Promise<void>;
}

export function CreateFeatureDialog({
  projectId,
  onClose,
  onCreate,
}: CreateFeatureDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreate({
        project_id: projectId,
        title: title.trim(),
        category: category.trim() || undefined,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-primary border border-border rounded-lg w-full max-w-md p-base">
        <div className="flex items-center justify-between mb-base">
          <h2 className="text-lg font-semibold text-normal">Create Feature</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <XIcon className="w-5 h-5 text-low" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-base">
          <div>
            <label className="block text-sm font-medium text-normal mb-1">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-normal mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex gap-2 justify-end pt-base border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="rounded-lg"
            >
              {isCreating ? 'Creating...' : 'Create Feature'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
