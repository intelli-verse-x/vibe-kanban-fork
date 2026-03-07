import { useState } from 'react';
import { XIcon, LinkIcon, PencilIcon, CheckIcon } from '@phosphor-icons/react';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { Button } from '@vibe/ui/components/Button';
import { useProjectContext } from '@/shared/hooks/useProjectContext';
import { useOrgContext } from '@/shared/hooks/useOrgContext';
import type {
  IssueExtended,
  UpdateIssueRequestExtended,
  IssueAssignee,
  Feature,
} from '../types';

interface TaskDetailPanelProps {
  issue: IssueExtended;
  assignees: IssueAssignee[];
  features: Feature[];
  canEdit: boolean;
  onClose: () => void;
}

export function TaskDetailPanel({
  issue,
  assignees,
  features,
  canEdit,
  onClose,
}: TaskDetailPanelProps) {
  const { updateIssue, insertIssueAssignee, removeIssueAssignee } =
    useProjectContext();
  const { membersWithProfilesById } = useOrgContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedIssue, setEditedIssue] = useState<
    Partial<UpdateIssueRequestExtended>
  >({
    title: issue.title,
    description: issue.description || null,
    due_date: issue.due_date || null,
    git_link: issue.git_link || null,
    feature_id: issue.feature_id || null,
    priority: issue.priority || null,
  });
  const [editedResourceLinks, setEditedResourceLinks] = useState<string[]>(
    () => {
      const links = Array.isArray(issue.resource_links)
        ? issue.resource_links
        : typeof issue.resource_links === 'string'
          ? JSON.parse(issue.resource_links || '[]')
          : [];
      return links.map((link: any) =>
        typeof link === 'string' ? link : link.url || ''
      );
    }
  );
  const [newResourceLink, setNewResourceLink] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(
    issue.feature_id || ''
  );

  const feature = issue.feature_id
    ? features.find((f) => f.id === issue.feature_id)
    : null;

  const handleSave = async () => {
    try {
      const resourceLinksJson = editedResourceLinks.map((url) => ({
        url,
        label: url,
      }));
      await updateIssue(issue.id, {
        ...editedIssue,
        feature_id: selectedFeatureId || null,
        resource_links: resourceLinksJson as any,
      } as any);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update issue:', error);
    }
  };

  const handleAddResourceLink = () => {
    if (newResourceLink.trim()) {
      setEditedResourceLinks([...editedResourceLinks, newResourceLink.trim()]);
      setNewResourceLink('');
    }
  };

  const handleRemoveResourceLink = (index: number) => {
    setEditedResourceLinks(editedResourceLinks.filter((_, i) => i !== index));
  };

  const availableUsers = Array.from(membersWithProfilesById.values());
  const currentAssigneeIds = assignees.map((a) => a.user_id);

  const handleToggleAssignee = async (userId: string) => {
    const isAssigned = currentAssigneeIds.includes(userId);
    if (isAssigned) {
      const assignee = assignees.find((a) => a.user_id === userId);
      if (assignee) {
        await removeIssueAssignee(assignee.id);
      }
    } else {
      await insertIssueAssignee({
        issue_id: issue.id,
        user_id: userId,
      });
    }
  };

  return (
    <div className="w-96 border-l border-border bg-secondary flex flex-col h-full animate-in slide-in-from-right duration-200">
      <div className="p-base border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-normal">Task Details</h2>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {isEditing ? (
                <Tooltip content="Save changes">
                  <button
                    onClick={handleSave}
                    className="p-1 hover:bg-primary rounded transition-all duration-150 hover:scale-110"
                  >
                    <CheckIcon className="w-5 h-5 text-brand" />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip content="Edit task">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-primary rounded transition-all duration-150 hover:scale-110"
                  >
                    <PencilIcon className="w-5 h-5 text-low" />
                  </button>
                </Tooltip>
              )}
            </>
          )}
          <Tooltip content="Close panel">
            <button
              onClick={onClose}
              className="p-1 hover:bg-primary rounded transition-all duration-150 hover:scale-110"
            >
              <XIcon className="w-5 h-5 text-low" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-base space-y-base">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedIssue.title || ''}
              onChange={(e) =>
                setEditedIssue({ ...editedIssue, title: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <div className="mt-1 text-sm font-medium text-normal">
              {issue.title}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editedIssue.description || ''}
              onChange={(e) =>
                setEditedIssue({
                  ...editedIssue,
                  description: e.target.value || null,
                })
              }
              className="mt-1 w-full px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
              rows={4}
            />
          ) : (
            issue.description && (
              <div className="mt-1 text-sm text-normal whitespace-pre-wrap">
                {issue.description}
              </div>
            )
          )}
        </div>

        {/* Feature */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Feature
          </label>
          {isEditing ? (
            <select
              value={selectedFeatureId}
              onChange={(e) => setSelectedFeatureId(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">None</option>
              {features.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.feature_key} - {f.title}
                </option>
              ))}
            </select>
          ) : feature ? (
            <div className="mt-1">
              <span className="font-mono text-sm text-normal">
                {feature.feature_key}
              </span>
              <span className="text-sm text-low ml-2">- {feature.title}</span>
            </div>
          ) : (
            <div className="mt-1 text-sm text-low">-</div>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Due Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={
                editedIssue.due_date
                  ? new Date(editedIssue.due_date).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setEditedIssue({
                  ...editedIssue,
                  due_date: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="mt-1 w-full px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : issue.due_date ? (
            <div className="mt-1 text-sm text-normal">
              {new Date(issue.due_date).toLocaleDateString()}
            </div>
          ) : (
            <div className="mt-1 text-sm text-low">-</div>
          )}
        </div>

        {/* Git Link */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Git Link
          </label>
          {isEditing ? (
            <input
              type="url"
              value={editedIssue.git_link || ''}
              onChange={(e) =>
                setEditedIssue({
                  ...editedIssue,
                  git_link: e.target.value || null,
                })
              }
              placeholder="https://github.com/..."
              className="mt-1 w-full px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : issue.git_link ? (
            <div className="mt-1">
              <a
                href={issue.git_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand hover:text-brand-hover flex items-center gap-1"
              >
                <LinkIcon className="w-4 h-4" />
                {issue.git_link}
              </a>
            </div>
          ) : (
            <div className="mt-1 text-sm text-low">-</div>
          )}
        </div>

        {/* Resource Links */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Resource Links
          </label>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              {editedResourceLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...editedResourceLinks];
                      newLinks[index] = e.target.value;
                      setEditedResourceLinks(newLinks);
                    }}
                    className="flex-1 px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveResourceLink(index)}
                    className="rounded-lg"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newResourceLink}
                  onChange={(e) => setNewResourceLink(e.target.value)}
                  placeholder="Add resource link..."
                  className="flex-1 px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddResourceLink();
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddResourceLink}
                  className="rounded-lg"
                >
                  Add
                </Button>
              </div>
            </div>
          ) : editedResourceLinks.length > 0 ? (
            <div className="mt-1 space-y-1">
              {editedResourceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand hover:text-brand-hover flex items-center gap-1 block"
                >
                  <LinkIcon className="w-4 h-4" />
                  {link}
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-sm text-low">-</div>
          )}
        </div>

        {/* Assignees */}
        {canEdit && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Assignees
            </label>
            <div className="mt-1 space-y-1">
              {availableUsers.map((user) => {
                const isAssigned = currentAssigneeIds.includes(user.user_id);
                return (
                  <label
                    key={user.user_id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-primary/50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => handleToggleAssignee(user.user_id)}
                      className="rounded"
                    />
                    <span className="text-sm text-normal">
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : user.email || user.user_id}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Priority
          </label>
          {isEditing ? (
            <select
              value={editedIssue.priority || ''}
              onChange={(e) =>
                setEditedIssue({
                  ...editedIssue,
                  priority: (e.target.value as any) || null,
                })
              }
              className="mt-1 w-full px-3 py-2 bg-primary border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          ) : (
            issue.priority && (
              <div className="mt-1">
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${
                    issue.priority === 'urgent'
                      ? 'bg-red-500'
                      : issue.priority === 'high'
                        ? 'bg-orange-500'
                        : issue.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                  }`}
                >
                  {issue.priority}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
