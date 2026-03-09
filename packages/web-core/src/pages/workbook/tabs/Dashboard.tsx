import { useDashboardStats } from '@/shared/hooks/workbook/useWorkbookApi';
import { Loader } from '@vibe/ui/components/Loader';
import {
  ChartPie,
  Bug,
  Warning,
  Target,
  CalendarBlank,
  RocketLaunch,
  ChatCircleText,
  Clock,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react';

interface ProjectWorkbookDashboardProps {
  projectId: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <div
      className={`rounded-xl border p-4 ${colorClasses[color]} transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-60 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-current/10">{icon}</div>
      </div>
    </div>
  );
}

export function ProjectWorkbookDashboard({
  projectId,
}: ProjectWorkbookDashboardProps) {
  const { data: stats, isLoading, error } = useDashboardStats(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-base">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <p className="font-medium">Failed to load dashboard stats</p>
          <p className="text-sm mt-1 opacity-80">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-base">
        <div className="text-center py-12 text-low">
          <ChartPie className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No data available yet</p>
          <p className="text-sm mt-2">
            Start adding features, bugs, and other items to see your dashboard
            stats.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-base">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-normal mb-1">
          Project Dashboard
        </h1>
        <p className="text-sm text-low">
          Overview of your project metrics and status
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Features"
          value={stats.features_count}
          icon={<Target className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="KPIs"
          value={stats.kpis_count}
          icon={<ChartPie className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Total Bugs"
          value={stats.bugs_count}
          icon={<Bug className="w-5 h-5" />}
          subtitle={`${stats.open_bugs} open`}
          color={stats.open_bugs > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Risks"
          value={stats.risks_count}
          icon={<Warning className="w-5 h-5" />}
          subtitle={`${stats.open_risks} open`}
          color={stats.open_risks > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Sprints"
          value={stats.sprints_count}
          icon={<CalendarBlank className="w-5 h-5" />}
          subtitle={stats.active_sprint ? 'Sprint active' : 'No active sprint'}
          color={stats.active_sprint ? 'green' : 'gray'}
        />
        <StatCard
          title="Releases"
          value={stats.releases_count}
          icon={<RocketLaunch className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Feedback"
          value={stats.feedback_count}
          icon={<ChatCircleText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Time Logged"
          value={formatTime(stats.total_time_minutes)}
          icon={<Clock className="w-5 h-5" />}
          subtitle={`${stats.time_entries_count} entries`}
          color="green"
        />
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-layer-01 rounded-xl border border-border p-4">
          <h3 className="font-medium text-normal mb-4 flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Bug Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-low flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                Open Bugs
              </span>
              <span className="font-medium text-normal">{stats.open_bugs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-low flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Resolved Bugs
              </span>
              <span className="font-medium text-normal">
                {stats.bugs_count - stats.open_bugs}
              </span>
            </div>
            <div className="w-full bg-layer-02 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width:
                    stats.bugs_count > 0
                      ? `${((stats.bugs_count - stats.open_bugs) / stats.bugs_count) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-layer-01 rounded-xl border border-border p-4">
          <h3 className="font-medium text-normal mb-4 flex items-center gap-2">
            <Warning className="w-4 h-4" />
            Risk Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-low flex items-center gap-2">
                <XCircle className="w-4 h-4 text-yellow-400" />
                Open Risks
              </span>
              <span className="font-medium text-normal">
                {stats.open_risks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-low flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Mitigated Risks
              </span>
              <span className="font-medium text-normal">
                {stats.risks_count - stats.open_risks}
              </span>
            </div>
            <div className="w-full bg-layer-02 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width:
                    stats.risks_count > 0
                      ? `${((stats.risks_count - stats.open_risks) / stats.risks_count) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
