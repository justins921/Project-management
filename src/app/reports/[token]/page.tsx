import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ReportData {
  client_info: {
    business_name: string;
    contact_name: string;
    contact_email: string;
  };
  projects_summary: { id: string; name: string; status: string }[];
  tasks_completed_count: number;
  site_health_snapshot: {
    url?: string;
    performance_score: number | null;
    seo_score: number | null;
  }[];
  custom_notes: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function scoreColor(score: number | null): string {
  if (score === null) return 'bg-slate-200 text-slate-500';
  if (score >= 90) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Fetch the report by share_token
  const { data: report } = await supabase
    .from('monthly_reports')
    .select('*, client:clients(id, business_name)')
    .eq('share_token', token)
    .single();

  if (!report) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--background, #f8fafc)' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-100">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Report Not Found
          </h1>
          <p className="text-sm text-slate-500">
            This report link may be invalid or the report has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Fetch the tenant (agency) info
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id, agency_name, agency_logo_url')
    .eq('id', report.tenant_id)
    .single();

  const data = report.report_data as ReportData | null;

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        {/* Report Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
          <div className="flex items-center gap-4 mb-6">
            {tenantData?.agency_logo_url ? (
              <img
                src={tenantData.agency_logo_url}
                alt={tenantData.agency_name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {tenantData?.agency_name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {tenantData?.agency_name || 'Agency'}
              </h1>
              <p className="text-sm text-slate-500">Monthly Report</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-x-8 gap-y-2">
            <div className="text-sm">
              <span className="text-slate-500">Client: </span>
              <span className="font-semibold text-slate-900">
                {data?.client_info?.business_name ||
                  report.client?.business_name ||
                  'N/A'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Period: </span>
              <span className="font-semibold text-slate-900">
                {formatMonth(report.report_month)}
              </span>
            </div>
            {data?.client_info?.contact_name && (
              <div className="text-sm">
                <span className="text-slate-500">Contact: </span>
                <span className="font-semibold text-slate-900">
                  {data.client_info.contact_name}
                </span>
              </div>
            )}
          </div>
        </div>

        {data ? (
          <>
            {/* Projects Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Active Projects
              </h2>
              {data.projects_summary.length > 0 ? (
                <div className="space-y-2">
                  {data.projects_summary.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {project.name}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700">
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No active projects this period.
                </p>
              )}
            </div>

            {/* Tasks Completed */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Tasks Completed
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600">
                  {data.tasks_completed_count}
                </span>
                <span className="text-sm text-slate-500">
                  tasks completed this month
                </span>
              </div>
            </div>

            {/* Site Health */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-violet-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Site Health
              </h2>
              {data.site_health_snapshot.length > 0 ? (
                <div className="space-y-3">
                  {data.site_health_snapshot.map((site, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-3 rounded-lg bg-slate-50"
                    >
                      {site.url && (
                        <span className="text-sm text-slate-700 truncate max-w-[240px]">
                          {site.url}
                        </span>
                      )}
                      <div className="flex gap-4 sm:ml-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            Performance
                          </span>
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${scoreColor(
                              site.performance_score
                            )}`}
                          >
                            {site.performance_score ?? '?'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">SEO</span>
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${scoreColor(
                              site.seo_score
                            )}`}
                          >
                            {site.seo_score ?? '?'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No site health data available.
                </p>
              )}
            </div>

            {/* Custom Notes */}
            {data.custom_notes && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Notes
                </h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {data.custom_notes}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
            <p className="text-sm text-slate-500">
              Report data is not available.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8 print:pb-0">
          <p className="text-xs text-slate-400">
            Generated by {tenantData?.agency_name || 'Solo Agency OS'}
          </p>
        </div>
      </div>
    </div>
  );
}
