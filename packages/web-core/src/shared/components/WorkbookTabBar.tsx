import type { ElementType } from 'react';
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useProjectRole } from '@/shared/hooks/workbook/useProjectRole';
import type { WorkbookTab } from '@/project-routes/project-search';
import {
  SquaresFour,
  ChartPie,
  ListChecks,
  PuzzlePiece,
  Target,
  CalendarBlank,
  Bug,
  CurrencyDollar,
  Flask,
  Warning,
  ChatCircleText,
  RocketLaunch,
  GridNine,
  Clock,
  ChartLine,
} from '@phosphor-icons/react';

interface TabConfig {
  id: WorkbookTab;
  label: string;
  icon: ElementType;
  requiresPrivilegedRole: boolean;
  requiresAnalyticsRole?: boolean;
  description?: string;
}

const ALL_TABS: TabConfig[] = [
  {
    id: 'board',
    label: 'Board',
    icon: SquaresFour,
    requiresPrivilegedRole: false,
    description: 'Kanban board view',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: ChartPie,
    requiresPrivilegedRole: true,
    description: 'Project statistics',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: ListChecks,
    requiresPrivilegedRole: false,
    description: 'Task management',
  },
  {
    id: 'features',
    label: 'Features',
    icon: PuzzlePiece,
    requiresPrivilegedRole: true,
    description: 'Feature tracking',
  },
  {
    id: 'kpis',
    label: 'KPIs',
    icon: Target,
    requiresPrivilegedRole: true,
    description: 'Key performance indicators',
  },
  {
    id: 'sprint-tracker',
    label: 'Sprints',
    icon: CalendarBlank,
    requiresPrivilegedRole: true,
    description: 'Sprint planning',
  },
  {
    id: 'bugs',
    label: 'Bugs',
    icon: Bug,
    requiresPrivilegedRole: true,
    description: 'Bug tracking',
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: Warning,
    requiresPrivilegedRole: true,
    description: 'Risk management',
  },
  {
    id: 'releases',
    label: 'Releases',
    icon: RocketLaunch,
    requiresPrivilegedRole: true,
    description: 'Release management',
  },
  {
    id: 'time-tracking',
    label: 'Time',
    icon: Clock,
    requiresPrivilegedRole: false,
    description: 'Time tracking',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartLine,
    requiresPrivilegedRole: true,
    requiresAnalyticsRole: true,
    description: 'Advanced analytics',
  },
];

// Secondary tabs shown in a collapsible "more" menu
const SECONDARY_TABS: WorkbookTab[] = [
  'monetization',
  'ab-tests',
  'user-feedback',
  'kpi-feature-matrix',
];

const SECONDARY_TAB_CONFIGS: TabConfig[] = [
  {
    id: 'monetization',
    label: 'Monetization',
    icon: CurrencyDollar,
    requiresPrivilegedRole: true,
    description: 'Revenue tracking',
  },
  {
    id: 'ab-tests',
    label: 'A/B Tests',
    icon: Flask,
    requiresPrivilegedRole: true,
    description: 'Experiment tracking',
  },
  {
    id: 'user-feedback',
    label: 'Feedback',
    icon: ChatCircleText,
    requiresPrivilegedRole: true,
    description: 'User feedback',
  },
  {
    id: 'kpi-feature-matrix',
    label: 'KPI Matrix',
    icon: GridNine,
    requiresPrivilegedRole: true,
    description: 'KPI-Feature mapping',
  },
];

interface WorkbookTabBarProps {
  projectId: string;
  className?: string;
}

export function WorkbookTabBar({ projectId, className }: WorkbookTabBarProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const activeTab = (search.tab as WorkbookTab) || 'board';
  const { data: role, isLoading: roleLoading } = useProjectRole(projectId);
  const [hoveredTab, setHoveredTab] = useState<WorkbookTab | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const tabRefs = useRef<Map<WorkbookTab, HTMLButtonElement>>(new Map());
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });

  const isPrivileged = useMemo(() => {
    if (!role) return false;
    return [
      'admin',
      'team_leader',
      'project_manager',
      'project_owner',
    ].includes(role);
  }, [role]);

  const canViewAnalytics = useMemo(() => {
    if (!role) return false;
    return ['team_leader', 'project_manager', 'project_owner'].includes(role);
  }, [role]);

  const visibleTabs = useMemo(() => {
    return ALL_TABS.filter((tab) => {
      if (SECONDARY_TABS.includes(tab.id)) return false;
      if (tab.requiresAnalyticsRole) return canViewAnalytics;
      return !tab.requiresPrivilegedRole || isPrivileged;
    });
  }, [isPrivileged, canViewAnalytics]);

  const visibleSecondaryTabs = useMemo(() => {
    return SECONDARY_TAB_CONFIGS.filter((tab) => {
      if (tab.requiresAnalyticsRole) return canViewAnalytics;
      return !tab.requiresPrivilegedRole || isPrivileged;
    });
  }, [isPrivileged, canViewAnalytics]);

  // Update active indicator position
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab);
    if (activeButton) {
      const rect = activeButton.getBoundingClientRect();
      const containerRect = activeButton.parentElement?.getBoundingClientRect();
      if (containerRect) {
        setActiveIndicator({
          left: rect.left - containerRect.left,
          width: rect.width,
        });
      }
    }
  }, [activeTab, visibleTabs]);

  const handleTabChange = useCallback(
    (tab: WorkbookTab) => {
      setShowMoreMenu(false);
      navigate({
        to: '.',
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          tab: tab === 'board' ? undefined : tab,
        }),
        replace: true,
      });
    },
    [navigate]
  );

  if (roleLoading) {
    return (
      <div className={cn('h-12 bg-secondary/50 animate-pulse', className)} />
    );
  }

  return (
    <div
      className={cn(
        'relative border-b border-border/50 bg-gradient-to-r from-secondary via-secondary/95 to-secondary',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="px-4 py-2">
        <div className="relative flex items-center gap-1">
          {/* Active indicator with smooth animation */}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-brand rounded-full"
            initial={false}
            animate={{
              left: activeIndicator.left,
              width: activeIndicator.width,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />

          {/* Primary tabs */}
          <div className="flex items-center gap-0.5">
            {visibleTabs.map((tab: TabConfig) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  ref={(el: HTMLButtonElement | null) => {
                    if (el) tabRefs.current.set(tab.id, el);
                  }}
                  onClick={() => handleTabChange(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-2 rounded-lg',
                    'text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                    isActive ? 'text-normal' : 'text-low hover:text-normal',
                    !isActive && 'hover:bg-tertiary/50'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon
                      size={16}
                      weight={isActive ? 'fill' : 'regular'}
                      className={cn(
                        'transition-colors duration-200',
                        isActive ? 'text-brand' : ''
                      )}
                    />
                  </motion.div>
                  <span className="hidden sm:inline">{tab.label}</span>

                  {/* Hover background */}
                  <AnimatePresence>
                    {isHovered && !isActive && (
                      <motion.div
                        className="absolute inset-0 bg-tertiary/30 rounded-lg -z-10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Active background glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-brand/5 rounded-lg -z-10"
                      layoutId="activeTabBg"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* More menu for secondary tabs */}
          {visibleSecondaryTabs.length > 0 && (
            <div className="relative ml-1">
              <motion.button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-lg',
                  'text-sm font-medium text-low hover:text-normal',
                  'hover:bg-tertiary/50 transition-all duration-200',
                  showMoreMenu && 'bg-tertiary/50 text-normal'
                )}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xs">More</span>
                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  animate={{ rotate: showMoreMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </motion.svg>
              </motion.button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    className={cn(
                      'absolute top-full right-0 mt-1 py-1 min-w-[180px]',
                      'bg-secondary border border-border rounded-lg shadow-lg',
                      'z-50'
                    )}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {visibleSecondaryTabs.map((tab: TabConfig) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2',
                            'text-sm text-left transition-colors duration-150',
                            isActive
                              ? 'bg-brand/10 text-brand'
                              : 'text-low hover:text-normal hover:bg-tertiary/50'
                          )}
                        >
                          <Icon
                            size={16}
                            weight={isActive ? 'fill' : 'regular'}
                          />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close more menu */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMoreMenu(false)}
        />
      )}
    </div>
  );
}
