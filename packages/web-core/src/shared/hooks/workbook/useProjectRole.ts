import { useQuery } from '@tanstack/react-query';
import { makeRequest, getRemoteApiUrl } from '@/shared/lib/remoteApi';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import {
  MemberRole,
  type OrganizationMemberWithProfile,
  type ListMembersResponse,
} from 'shared/types';

export type ProjectRole =
  | 'admin'
  | 'team_leader'
  | 'project_manager'
  | 'project_owner'
  | 'developer'
  | 'worker';

interface ProjectResponse {
  id: string;
  organization_id: string;
  name: string;
  // ... other fields
}

/**
 * Maps organization member role to project role.
 * ADMIN -> project_owner (full access to all workbook features)
 * MEMBER -> developer (basic access)
 */
function mapOrgRoleToProjectRole(orgRole: MemberRole): ProjectRole {
  switch (orgRole) {
    case MemberRole.ADMIN:
      return 'project_owner';
    case MemberRole.MEMBER:
      return 'developer';
    default:
      return 'developer';
  }
}

/**
 * Hook to get the current user's role in a project.
 *
 * In local mode (no remote API configured), returns 'project_owner' to enable
 * all features. In remote mode, derives role from organization membership.
 *
 * Note: This project uses organization-level RBAC, not project-level.
 * Users who can access a project inherit their organization role.
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
        // First, get the project to find its organization
        const projectResponse = await makeRequest(`/v1/projects/${projectId}`);
        if (!projectResponse.ok) {
          // If can't fetch project, user likely has access (passed auth) - give full access
          return 'project_owner';
        }
        const project = (await projectResponse.json()) as ProjectResponse;

        // Then get organization members to find user's role
        const membersResponse = await makeRequest(
          `/v1/organizations/${project.organization_id}/members`
        );
        if (!membersResponse.ok) {
          // If members endpoint fails, default to project_owner for authorized users
          return 'project_owner';
        }
        const data = (await membersResponse.json()) as ListMembersResponse;

        // Find current user's membership
        const membership = data.members.find(
          (m: OrganizationMemberWithProfile) => m.user_id === userId
        );
        if (membership) {
          return mapOrgRoleToProjectRole(membership.role);
        }

        // User is authenticated but not found in members - they may have been
        // added through invitation. Default to project_owner for now.
        return 'project_owner';
      } catch (error) {
        // If API fails, default to project_owner for authenticated users
        // This ensures workbook features work even if role check fails
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
