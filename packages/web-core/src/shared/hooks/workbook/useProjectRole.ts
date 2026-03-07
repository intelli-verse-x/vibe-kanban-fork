import { useQuery } from '@tanstack/react-query';
import { makeRequest, getRemoteApiUrl } from '@/shared/lib/remoteApi';
import { useAuth } from '@/shared/hooks/auth/useAuth';

export type ProjectRole =
  | 'admin'
  | 'team_leader'
  | 'project_manager'
  | 'project_owner'
  | 'developer'
  | 'worker';

interface ProjectMembership {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  updated_at: string;
}

interface ListProjectMembershipsResponse {
  memberships: ProjectMembership[];
}

/**
 * Hook to get the current user's role in a project.
 *
 * In local mode (no remote API configured), returns 'project_owner' to enable
 * all features. In remote mode, fetches the actual role from the API.
 */
export function useProjectRole(projectId: string | undefined) {
  const { userId, isSignedIn } = useAuth();

  // Check if we're in local mode (no remote API configured)
  const remoteApiUrl = getRemoteApiUrl();
  const isLocalMode = !remoteApiUrl;

  return useQuery({
    queryKey: ['project-role', projectId, userId, isLocalMode],
    queryFn: async (): Promise<ProjectRole | null> => {
      if (!projectId) throw new Error('Project ID required');

      // In local mode, give full access (project_owner role)
      if (isLocalMode) {
        return 'project_owner';
      }

      if (!userId) return null;

      try {
        const response = await makeRequest(
          `/v1/projects/${projectId}/memberships`
        );
        const data = (await response.json()) as ListProjectMembershipsResponse;

        // Find current user's membership
        const membership = data.memberships.find((m) => m.user_id === userId);
        return membership?.role || null;
      } catch (error) {
        // If API fails (e.g., endpoint doesn't exist), default to project_owner
        // This allows workbook features to work even if RBAC isn't set up
        console.warn(
          'Failed to fetch project role, defaulting to project_owner:',
          error
        );
        return 'project_owner';
      }
    },
    enabled: !!projectId && (isLocalMode || (!!userId && isSignedIn)),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on failure
  });
}
