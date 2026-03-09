import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '@/shared/lib/remoteApi';
import type {
  DashboardStats,
  Feature,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  ListFeaturesResponse,
  KPI,
  CreateKPIRequest,
  UpdateKPIRequest,
  ListKPIsResponse,
  Bug,
  CreateBugRequest,
  UpdateBugRequest,
  ListBugsResponse,
  Risk,
  CreateRiskRequest,
  UpdateRiskRequest,
  ListRisksResponse,
  SprintItem,
  CreateSprintItemRequest,
  UpdateSprintItemRequest,
  ListSprintItemsResponse,
  UserFeedback,
  CreateUserFeedbackRequest,
  UpdateUserFeedbackRequest,
  ListUserFeedbackResponse,
  Release,
  CreateReleaseRequest,
  UpdateReleaseRequest,
  ListReleasesResponse,
  ABTest,
  CreateABTestRequest,
  UpdateABTestRequest,
  ListABTestsResponse,
  MonetizationItem,
  CreateMonetizationItemRequest,
  UpdateMonetizationItemRequest,
  ListMonetizationItemsResponse,
  KPIFeatureMatrix,
  CreateKPIFeatureMatrixRequest,
  UpdateKPIFeatureMatrixRequest,
  ListKPIFeatureMatrixResponse,
  TimeEntry,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  ListTimeEntriesResponse,
} from '@/pages/workbook/tabs/types';

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      error.message || `Request failed with status ${response.status}`
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

// Dashboard Stats
export function useDashboardStats(projectId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/dashboard`
      );
      return handleResponse<DashboardStats>(response);
    },
    enabled: !!projectId,
  });
}

// Features
export function useFeatures(projectId: string | undefined) {
  return useQuery({
    queryKey: ['features', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/features`
      );
      const data = await handleResponse<ListFeaturesResponse>(response);
      return data.features;
    },
    enabled: !!projectId,
  });
}

export function useCreateFeature(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFeatureRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/features`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<Feature>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', projectId] });
    },
  });
}

export function useUpdateFeature(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFeatureRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/features/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<Feature>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', projectId] });
    },
  });
}

export function useDeleteFeature(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/features/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features', projectId] });
    },
  });
}

// KPIs
export function useKPIs(projectId: string | undefined) {
  return useQuery({
    queryKey: ['kpis', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/kpis`
      );
      const data = await handleResponse<ListKPIsResponse>(response);
      return data.kpis;
    },
    enabled: !!projectId,
  });
}

export function useCreateKPI(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKPIRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/kpis`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<KPI>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard-stats', projectId],
      });
    },
  });
}

export function useUpdateKPI(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateKPIRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/kpis/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<KPI>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard-stats', projectId],
      });
    },
  });
}

export function useDeleteKPI(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/kpis/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard-stats', projectId],
      });
    },
  });
}

// Bugs
export function useBugs(projectId: string | undefined) {
  return useQuery({
    queryKey: ['bugs', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/bugs`
      );
      const data = await handleResponse<ListBugsResponse>(response);
      return data.bugs;
    },
    enabled: !!projectId,
  });
}

export function useCreateBug(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBugRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/bugs`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<Bug>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
    },
  });
}

export function useUpdateBug(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBugRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/bugs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<Bug>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
    },
  });
}

export function useDeleteBug(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/bugs/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
    },
  });
}

// Risks
export function useRisks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['risks', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/risks`
      );
      const data = await handleResponse<ListRisksResponse>(response);
      return data.risks;
    },
    enabled: !!projectId,
  });
}

export function useCreateRisk(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRiskRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/risks`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<Risk>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', projectId] });
    },
  });
}

export function useUpdateRisk(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRiskRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/risks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<Risk>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', projectId] });
    },
  });
}

export function useDeleteRisk(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/risks/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', projectId] });
    },
  });
}

// Sprint Items
export function useSprintItems(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sprint-items', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/sprint-items`
      );
      const data = await handleResponse<ListSprintItemsResponse>(response);
      return data.sprint_items;
    },
    enabled: !!projectId,
  });
}

export function useCreateSprintItem(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSprintItemRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/sprint-items`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<SprintItem>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-items', projectId] });
    },
  });
}

export function useUpdateSprintItem(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSprintItemRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/sprint-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<SprintItem>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-items', projectId] });
    },
  });
}

export function useDeleteSprintItem(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/sprint-items/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-items', projectId] });
    },
  });
}

// User Feedback
export function useUserFeedback(projectId: string | undefined) {
  return useQuery({
    queryKey: ['user-feedback', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/feedback`
      );
      const data = await handleResponse<ListUserFeedbackResponse>(response);
      return data.feedback;
    },
    enabled: !!projectId,
  });
}

export function useCreateUserFeedback(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserFeedbackRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/feedback`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<UserFeedback>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-feedback', projectId] });
    },
  });
}

export function useUpdateUserFeedback(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserFeedbackRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/feedback/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<UserFeedback>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-feedback', projectId] });
    },
  });
}

export function useDeleteUserFeedback(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/feedback/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-feedback', projectId] });
    },
  });
}

// Releases
export function useReleases(projectId: string | undefined) {
  return useQuery({
    queryKey: ['releases', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/releases`
      );
      const data = await handleResponse<ListReleasesResponse>(response);
      return data.releases;
    },
    enabled: !!projectId,
  });
}

export function useCreateRelease(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReleaseRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/releases`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<Release>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    },
  });
}

export function useUpdateRelease(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateReleaseRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/releases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<Release>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    },
  });
}

export function useDeleteRelease(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/releases/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    },
  });
}

// AB Tests
export function useABTests(projectId: string | undefined) {
  return useQuery({
    queryKey: ['ab-tests', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/ab-tests`
      );
      const data = await handleResponse<ListABTestsResponse>(response);
      return data.ab_tests;
    },
    enabled: !!projectId,
  });
}

export function useCreateABTest(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateABTestRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/ab-tests`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<ABTest>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests', projectId] });
    },
  });
}

export function useUpdateABTest(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateABTestRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/ab-tests/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<ABTest>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests', projectId] });
    },
  });
}

export function useDeleteABTest(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/ab-tests/${id}`,
        {
          method: 'DELETE',
        }
      );
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests', projectId] });
    },
  });
}

// Monetization
export function useMonetizationItems(projectId: string | undefined) {
  return useQuery({
    queryKey: ['monetization', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/monetization`
      );
      const data =
        await handleResponse<ListMonetizationItemsResponse>(response);
      return data.monetization_items;
    },
    enabled: !!projectId,
  });
}

export function useCreateMonetizationItem(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMonetizationItemRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/monetization`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<MonetizationItem>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monetization', projectId] });
    },
  });
}

export function useUpdateMonetizationItem(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMonetizationItemRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/monetization/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<MonetizationItem>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monetization', projectId] });
    },
  });
}

export function useDeleteMonetizationItem(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/monetization/${id}`,
        {
          method: 'DELETE',
        }
      );
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monetization', projectId] });
    },
  });
}

// KPI Feature Matrix
export function useKPIFeatureMatrix(projectId: string | undefined) {
  return useQuery({
    queryKey: ['kpi-feature-matrix', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/kpi-feature-matrix`
      );
      const data = await handleResponse<ListKPIFeatureMatrixResponse>(response);
      return data.kpi_feature_matrix;
    },
    enabled: !!projectId,
  });
}

export function useCreateKPIFeatureMatrix(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKPIFeatureMatrixRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/kpi-feature-matrix`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<KPIFeatureMatrix>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kpi-feature-matrix', projectId],
      });
    },
  });
}

export function useUpdateKPIFeatureMatrix(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateKPIFeatureMatrixRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/kpi-feature-matrix/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<KPIFeatureMatrix>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kpi-feature-matrix', projectId],
      });
    },
  });
}

export function useDeleteKPIFeatureMatrix(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/kpi-feature-matrix/${id}`,
        {
          method: 'DELETE',
        }
      );
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kpi-feature-matrix', projectId],
      });
    },
  });
}

// Time Entries
export function useTimeEntries(projectId: string | undefined) {
  return useQuery({
    queryKey: ['time-entries', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/time-entries`
      );
      const data = await handleResponse<ListTimeEntriesResponse>(response);
      return data.time_entries;
    },
    enabled: !!projectId,
  });
}

export function useCreateTimeEntry(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTimeEntryRequest) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(
        `/v1/projects/${projectId}/workbook/time-entries`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return handleResponse<TimeEntry>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
    },
  });
}

export function useUpdateTimeEntry(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTimeEntryRequest;
    }) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/time-entries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<TimeEntry>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
    },
  });
}

export function useDeleteTimeEntry(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!projectId) throw new Error('Project ID required');
      const response = await makeRequest(`/v1/workbook/time-entries/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
    },
  });
}
