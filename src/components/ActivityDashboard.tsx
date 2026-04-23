import { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, Clock, Loader2, ArrowUpRight, Filter } from 'lucide-react';

type ActivityStatusFilter = 'all' | 'success' | 'failure';
type ActivityLog = {
  created_at: string;
  error_message?: string | null;
  feature_name: string;
  id: number;
  input_payload?: string | null;
  output_payload?: string | null;
  status: 'success' | 'failure';
};
type FeatureConfig = {
  buildRestorePayload: (input: any, output: any) => any;
  hiddenFromActivity?: boolean;
  label: string;
  restorePriority: number;
  tab: string;
};

const buildDefaultRestorePayload = (input: any, output: any) => ({ ...(input || {}), output_payload: output });

const buildCampaignRestorePayload = (input: any, output: any) => {
  const config = input?.config || input || {};
  return {
    ...config,
    restored_channel: input?.channel || null,
    restored_idea: input?.idea || null,
    output_payload: output
  };
};

const FEATURE_META: Record<string, FeatureConfig> = {
  'campaign/ideas': { label: 'Campaigns', tab: 'campaign', restorePriority: 100, buildRestorePayload: buildCampaignRestorePayload },
  'campaign/assets': { label: 'Campaigns', tab: 'campaign', restorePriority: 60, buildRestorePayload: buildCampaignRestorePayload },
  'campaign/image_generate': { label: 'Campaigns', tab: 'campaign', restorePriority: 10, hiddenFromActivity: true, buildRestorePayload: buildCampaignRestorePayload },
  'upload': { label: 'Campaigns', tab: 'campaign', restorePriority: 0, hiddenFromActivity: true, buildRestorePayload: buildCampaignRestorePayload },
  'discover': { label: 'Discovery Hub', tab: 'discover', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'repurpose': { label: 'Repurposing Engine', tab: 'repurpose', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'generate': { label: 'Draft Post', tab: 'generator', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'iterate': { label: 'Draft Post', tab: 'generator', restorePriority: 10, hiddenFromActivity: true, buildRestorePayload: buildDefaultRestorePayload },
  'generate-hooks': { label: 'Hook Generator', tab: 'hooks', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'rewrite': { label: 'Rewriter', tab: 'rewriter', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'generate-visuals': { label: 'Visual Studio', tab: 'visuals', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'generate-engagement': { label: 'Engagement Assistant', tab: 'engagement', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'schedule': { label: 'Schedule', tab: 'command', restorePriority: 10, hiddenFromActivity: true, buildRestorePayload: buildDefaultRestorePayload },
  'insights': { label: 'Schedule', tab: 'command', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload },
  'trend-analyse': { label: 'Trend Analyser', tab: 'trend', restorePriority: 100, buildRestorePayload: buildDefaultRestorePayload }
};

export function ActivityDashboard({ onNavigate }: { onNavigate: (featureId: string, data: any) => void }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ActivityStatusFilter>('all');

  useEffect(() => {
    fetch('http://localhost:3001/api/activity_logs')
      .then(res => res.json())
      .then(data => { setLogs(data); setIsLoading(false); })
      .catch(e => { console.error(e); setIsLoading(false); });
  }, []);

  const formatFeatureName = (str: string) => str.split(/[-_/]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const getFeatureConfig = (route: string): FeatureConfig => FEATURE_META[route] || {
    label: formatFeatureName(route),
    tab: route,
    restorePriority: -1,
    hiddenFromActivity: true,
    buildRestorePayload: buildDefaultRestorePayload
  };

  const getInputSummary = (payloadStr?: string | null) => {
    try {
      if (!payloadStr) return 'No saved inputs.';
      const obj = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
      const normalized = obj?.config || obj;
      if (normalized.url || normalized.startDate || normalized.endDate) {
        return `${normalized.url || 'Unknown domain'}${normalized.startDate && normalized.endDate ? ` • ${normalized.startDate} to ${normalized.endDate}` : ''}`;
      }
      if (normalized.topic) return normalized.topic;
      if (normalized.niche || normalized.audience) return [normalized.niche, normalized.audience].filter(Boolean).join(' • ');
      if (normalized.content) return normalized.content;
      if (normalized.sourceMaterial) return normalized.sourceMaterial;
      if (normalized.campaign_name) return [normalized.campaign_name, normalized.product_info?.name].filter(Boolean).join(' • ');
      if (obj.idea?.idea_summary) return obj.idea.idea_summary;
      const str = typeof payloadStr === 'string' ? payloadStr : JSON.stringify(payloadStr);
      return str.length > 140 ? str.substring(0, 140) + '...' : str;
    } catch (e) {
      return (payloadStr || '').substring(0, 140) + '...';
    }
  };

  const getOutputSummary = (payloadStr?: string | null) => {
    try {
      if (!payloadStr) return 'No output recorded.';
      const obj = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
      if (Array.isArray(obj)) {
        const categories = new Set(obj.map(item => item?.feature_category).filter(Boolean)).size;
        return `${obj.length} saved insights${categories ? ` across ${categories} categories` : ''}.`;
      }
      if (obj.output) return typeof obj.output === 'string' ? obj.output.substring(0, 160) : JSON.stringify(obj.output).substring(0, 160);
      if (obj.post) return obj.post.substring(0, 160);
      if (obj.hooks) return `Generated ${obj.hooks.length} hooks.`;
      if (obj.copy) return obj.copy.substring(0, 160);
      const str = typeof payloadStr === 'string' ? payloadStr : JSON.stringify(payloadStr);
      return str.length > 160 ? str.substring(0, 160) + '...' : str;
    } catch (e) {
      return (payloadStr || '').substring(0, 160) + '...';
    }
  };

  const handleRestore = (log: any) => {
    try {
      const input = typeof log.input_payload === 'string' ? JSON.parse(log.input_payload) : log.input_payload;
      const output = log.output_payload ? (typeof log.output_payload === 'string' ? JSON.parse(log.output_payload) : log.output_payload) : null;
      const feature = getFeatureConfig(log.feature_name);
      const payload = feature.buildRestorePayload(input, output);
      const tabId = feature.tab;
      onNavigate(tabId, payload);
    } catch(e) {
      alert("Failed to parse the saved session payload.");
    }
  };

  const latestLogsByFeature: ActivityLog[] = [];
  const featureIndexByTab = new Map<string, number>();

  for (const log of logs) {
    const feature = getFeatureConfig(log.feature_name);
    if (feature.hiddenFromActivity) continue;

    const existingIndex = featureIndexByTab.get(feature.tab);
    if (existingIndex === undefined) {
      featureIndexByTab.set(feature.tab, latestLogsByFeature.length);
      latestLogsByFeature.push(log);
      continue;
    }

    const existingLog = latestLogsByFeature[existingIndex];
    const existingFeature = getFeatureConfig(existingLog.feature_name);
    if (feature.restorePriority > existingFeature.restorePriority) {
      latestLogsByFeature[existingIndex] = log;
    }
  }

  const visibleLogs = latestLogsByFeature.filter((log) => statusFilter === 'all' ? true : log.status === statusFilter);
  const successCount = latestLogsByFeature.filter(log => log.status === 'success').length;
  const failureCount = latestLogsByFeature.filter(log => log.status === 'failure').length;

  const FILTERS: Array<{ id: ActivityStatusFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: latestLogsByFeature.length },
    { id: 'success', label: 'Successful', count: successCount },
    { id: 'failure', label: 'Failed', count: failureCount }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Activity Library</h2>
                <p className="mt-1 text-sm sm:text-base text-gray-500 max-w-2xl">Latest saved run per feature across the toolkit. Restore a session with its recorded inputs and output snapshot without digging through full payloads.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[280px]">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Features</div>
                <div className="mt-2 text-2xl font-black text-gray-900">{latestLogsByFeature.length}</div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600/70">Success</div>
                <div className="mt-2 text-2xl font-black text-emerald-700">{successCount}</div>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600/70">Failed</div>
                <div className="mt-2 text-2xl font-black text-rose-700">{failureCount}</div>
              </div>
            </div>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-gray-400" />
               <h3 className="font-bold text-gray-800">Latest Sessions</h3>
               <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full">{visibleLogs.length} shown</span>
             </div>

             <div className="flex flex-wrap items-center gap-2">
               <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                 <Filter className="w-3.5 h-3.5" />
                 Status
               </span>
               {FILTERS.map(filter => (
                 <button
                   key={filter.id}
                   onClick={() => setStatusFilter(filter.id)}
                   className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                     statusFilter === filter.id
                       ? 'bg-gray-900 text-white'
                       : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                   }`}
                 >
                   {filter.label}
                   <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${statusFilter === filter.id ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'}`}>
                     {filter.count}
                   </span>
                 </button>
               ))}
             </div>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-400">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
               <p className="font-bold">Syncing historical logs...</p>
            </div>
          ) : latestLogsByFeature.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
               <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p className="font-bold text-lg text-gray-500">No activities recorded yet.</p>
               <p className="text-sm">Run a feature to see it logged here.</p>
            </div>
          ) : visibleLogs.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
               <Filter className="w-12 h-12 mx-auto mb-4 opacity-40" />
               <p className="font-bold text-lg text-gray-500">No sessions match this filter.</p>
               <p className="text-sm">Switch the status filter to see more saved activity.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
               {visibleLogs.map((log) => {
                  const feature = getFeatureConfig(log.feature_name);

                  return (
                    <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition">
                       <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                             <div className={`mt-1 p-2.5 rounded-2xl ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {log.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                             </div>

                             <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">{feature.label}</h4>
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${log.status === 'success' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}>
                                     {log.status}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                                    {log.feature_name}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs text-gray-500 font-mono">
                                   {new Date(log.created_at).toLocaleString()}
                                </p>

                                <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3 max-w-4xl">
                                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2">Input Snapshot</div>
                                    <p className="text-sm text-gray-600 leading-6 line-clamp-3">{getInputSummary(log.input_payload)}</p>
                                  </div>

                                  {log.status === 'failure' && log.error_message ? (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500 mb-2">Error</div>
                                      <p className="text-sm text-rose-700 leading-6 line-clamp-3">{log.error_message}</p>
                                    </div>
                                  ) : (
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500 mb-2">Output Snapshot</div>
                                      <p className="text-sm text-indigo-950/75 leading-6 line-clamp-3">{getOutputSummary(log.output_payload)}</p>
                                    </div>
                                  )}
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-2 lg:pl-4">
                            <button onClick={() => handleRestore(log)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors border border-gray-200 bg-white hover:bg-slate-100 hover:border-emerald-300 h-10 px-4 py-2 text-slate-700">
                              Restore Session <ArrowUpRight className="w-4 h-4 opacity-60" />
                            </button>
                            {feature.tab === 'trend' && log.status === 'success' && (
                              <p className="text-xs text-gray-500 max-w-[220px] lg:text-right">Reopens Trend Analyser with the saved domain, date range, and generated matrix.</p>
                            )}
                          </div>
                       </div>
                    </div>
                  );
               })}
            </div>
          )}
       </div>
    </div>
  );
}
