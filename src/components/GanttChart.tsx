'use client';

import { Project } from '@/lib/types';
import { getClient } from '@/lib/data';
import StatusBadge from './StatusBadge';
import ServiceBadge from './ServiceBadge';

interface GanttChartProps {
  projects: Project[];
}

export default function GanttChart({ projects }: GanttChartProps) {
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Calculate the timeline range
  const allDates = sortedProjects.flatMap((p) => [
    new Date(p.startDate),
    new Date(p.endDate),
  ]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Add padding
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 1);
  maxDate.setDate(0);

  const totalDays = Math.ceil(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Generate month labels
  const months: { label: string; startPercent: number; widthPercent: number }[] = [];
  const cursor = new Date(minDate);
  while (cursor <= maxDate) {
    const monthStart = new Date(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startDay = Math.ceil(
      (monthStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const endDay = Math.ceil(
      (Math.min(monthEnd.getTime(), maxDate.getTime()) - minDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    months.push({
      label: monthStart.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      startPercent: (startDay / totalDays) * 100,
      widthPercent: ((endDay - startDay) / totalDays) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(1);
  }

  // Today marker
  const today = new Date();
  const todayPercent =
    ((today.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) *
    100;

  const barColors: Record<string, string> = {
    'Web Design': 'bg-violet-500',
    SEO: 'bg-cyan-500',
    'Social Media Marketing': 'bg-pink-500',
    Branding: 'bg-orange-500',
    'Content Marketing': 'bg-teal-500',
    'PPC Advertising': 'bg-red-500',
  };

  return (
    <div className="bg-card-bg rounded-xl border border-card-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-card-border">
        <h2 className="text-lg font-semibold text-foreground">Project Timeline</h2>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Month headers */}
          <div className="flex border-b border-card-border bg-slate-50/50 relative">
            <div className="w-72 shrink-0 px-4 py-2.5 text-xs font-medium text-muted uppercase tracking-wider">
              Project
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {months.map((month, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium text-muted py-2.5 text-center border-l border-card-border/50"
                    style={{ width: `${month.widthPercent}%` }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project rows */}
          {sortedProjects.map((project) => {
            const client = getClient(project.clientId);
            const startPercent =
              ((new Date(project.startDate).getTime() - minDate.getTime()) /
                (maxDate.getTime() - minDate.getTime())) *
              100;
            const endPercent =
              ((new Date(project.endDate).getTime() - minDate.getTime()) /
                (maxDate.getTime() - minDate.getTime())) *
              100;
            const widthPercent = endPercent - startPercent;

            return (
              <div
                key={project.id}
                className="flex items-center border-b border-card-border/50 hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-72 shrink-0 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted">{client?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative h-12">
                  {/* Month grid lines */}
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-card-border/30"
                      style={{ left: `${month.startPercent}%` }}
                    />
                  ))}
                  {/* Today line */}
                  {todayPercent > 0 && todayPercent < 100 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                      style={{ left: `${todayPercent}%` }}
                    />
                  )}
                  {/* Bar */}
                  <div
                    className={`absolute top-2.5 h-7 rounded-full ${barColors[project.service] || 'bg-blue-500'} ${project.status === 'Completed' ? 'opacity-50' : ''} ${project.status === 'On Hold' ? 'opacity-60 bg-stripes' : ''} shadow-sm flex items-center justify-center`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${Math.max(widthPercent, 2)}%`,
                    }}
                  >
                    <span className="text-[10px] font-medium text-white truncate px-2">
                      {project.service}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Legend row */}
          <div className="px-4 py-3 bg-slate-50/50 border-t border-card-border flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted font-medium">Services:</span>
            {Object.entries(barColors).map(([service, color]) => (
              <div key={service} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs text-muted">{service}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-4">
              <div className="w-4 h-px bg-red-400" />
              <span className="text-xs text-muted">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
