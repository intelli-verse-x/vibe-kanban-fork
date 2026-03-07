import { useState, useEffect } from 'react';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { XIcon } from '@phosphor-icons/react';

interface CreateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  title: string;
  fields: FieldDef[];
  initialData?: Record<string, any>;
  isSubmitting?: boolean;
  error?: Error | null;
}

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export function CreateEditDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData,
  isSubmitting = false,
  error,
}: CreateEditDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setSubmitError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in-0 duration-200">
      <div className="bg-primary border border-border rounded-lg w-full max-w-2xl p-base max-h-[90vh] overflow-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-base">
          <h2 className="text-lg font-semibold text-normal">{title}</h2>
          <Tooltip content="Close dialog">
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded transition-all duration-150 hover:scale-110"
            >
              <XIcon className="w-5 h-5 text-low" />
            </button>
          </Tooltip>
        </div>

        <form onSubmit={handleSubmit} className="space-y-base">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-normal mb-1">
                {field.label}
                {field.required && <span className="text-error ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    handleChange(
                      field.key,
                      field.type === 'number'
                        ? parseFloat(e.target.value) || 0
                        : e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {(error || submitError) && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">
                {error?.message || submitError || 'An error occurred'}
              </p>
            </div>
          )}

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
              disabled={isSubmitting}
              className="rounded-lg"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
