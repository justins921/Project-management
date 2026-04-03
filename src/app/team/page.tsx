import { teamMembers, getProjectsByTeamMember } from '@/lib/data';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import ServiceBadge from '@/components/ServiceBadge';
import Link from 'next/link';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted mt-1">{teamMembers.length} team members</p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const memberProjects = getProjectsByTeamMember(member.id);
          const activeProjects = memberProjects.filter((p) => p.status === 'Active');

          return (
            <div
              key={member.id}
              className="bg-card-bg rounded-xl border border-card-border p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={member.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted">{member.role}</p>
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    {member.email}
                  </a>
                </div>
              </div>

              {/* Workload bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted mb-1">
                  <span>Active projects</span>
                  <span className="font-medium">{activeProjects.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      activeProjects.length >= 3
                        ? 'bg-danger'
                        : activeProjects.length >= 2
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(100, (activeProjects.length / 4) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Projects list */}
              <div className="space-y-2">
                {memberProjects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {project.name}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                ))}
                {memberProjects.length > 3 && (
                  <p className="text-xs text-muted text-center pt-1">
                    +{memberProjects.length - 3} more
                  </p>
                )}
                {memberProjects.length === 0 && (
                  <p className="text-xs text-muted text-center py-2">No projects assigned</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
