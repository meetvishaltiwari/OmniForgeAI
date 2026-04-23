import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Globe,
  Calendar,
  Loader2,
  BarChart3,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Zap,
  Target,
  Users,
  Compass,
  ZapIcon
} from 'lucide-react';
import { PublishActions } from './Shared';
import { useToast } from '../contexts/ToastContext';

type Confidence = 'High' | 'Medium' | 'Low';
type Status = 'Valid' | 'Partial' | 'Missing';

const getConfidenceColor = (conf?: Confidence) => {
  switch (conf) {
    case 'High': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-100';
    case 'Low': return 'text-rose-700 bg-rose-50 border-rose-100';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
};

const getStatusColor = (status?: Status) => {
  switch (status) {
    case 'Valid': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    case 'Partial': return 'text-amber-700 bg-amber-50 border-amber-100';
    case 'Missing': return 'text-rose-700 bg-rose-50 border-rose-100';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
};

export function TrendAnalyser({ onNavigate }: { onNavigate?: (tab: string, data?: any) => void }) {
  const { showQuotaError, showToast } = useToast();
  const [domain, setDomain] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [displayDomain, setDisplayDomain] = useState('');

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsLoading(true);
    setResults(null);
    setDisplayDomain(domain);

    try {
      const response = await fetch('http://localhost:3001/api/trend-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domain, startDate, endDate })
      });

      const data = await response.json();
      if (data.quotaExceeded) {
        showQuotaError(data.error);
        return;
      }
      if (data.error) {
        showToast(data.error, 'error');
        return;
      }

      setResults(data);
    } catch (e) {
      showToast('Backend analysis failed. Verify server.js is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = results ? Object.keys(results).filter(k => k !== 'metadata') : [];

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[600px]">
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-8">
        {/* Left Control Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">Trend Intel</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">Deep Matrix Engine</p>
              </div>
            </div>

            <form onSubmit={runAnalysis} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 ml-1">Target Market/Domain</label>
                <div className="relative">
                  <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="stripe.com or 'B2B Fintech'"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 ml-1">From</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 ml-1">To</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Deep Scrape
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    Construct Intelligence
                  </>
                )
              }
              </button>
            </form>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <AlertCircle className="w-20 h-20" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-4">Matrix Parameters</h3>
             <ul className="space-y-4">
                {[
                  { label: 'Scrape Depth', value: 'Level 4 (Exhaustive)' },
                  { label: 'Cross-Ref', value: '8 Sub-Feature goals' },
                  { label: 'Model', value: 'Gemini 1.5 Pro' },
                  { label: 'Latency', value: '~15-25s' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-slate-400">{item.label}</span>
                    <span className="text-xs font-mono text-indigo-200">{item.value}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Right Output Area */}
        <div className="min-h-[700px]">
          {isLoading ? (
            <div className="h-full bg-white rounded-3xl border border-gray-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-indigo-50 rounded-full"></div>
                <div className="w-24 h-24 border-t-4 border-indigo-600 rounded-full animate-spin absolute inset-0"></div>
                <Compass className="w-10 h-10 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tighter">Initializing Recursive Scan</h3>
              <p className="text-gray-500 max-w-sm font-medium">Aggregating market sentiment, product gaps, and cross-channel trends for <span className="text-indigo-600 font-bold">{domain}</span>. This usually takes 20 seconds.</p>
              
              <div className="mt-12 w-full max-w-md space-y-3">
                 <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                   <span>Scanning 8 Matrix Nodes</span>
                   <span className="animate-pulse">Active</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 rounded-full animate-[progress_20s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                 </div>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-indigo-600 rounded-[32px] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Research Snapshot</span>
                    <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">• {results.metadata?.timestamp || 'Live'}</span>
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4">Deep Matrix Intelligence: {displayDomain}</h3>
                  <p className="text-indigo-100 text-lg sm:text-xl font-medium max-w-3xl leading-relaxed">
                    Scanned 8 market vectors. Surfaced {categories.length} core opportunity clusters with sentiment and product-gap alignment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {categories.map((category) => {
                  const items = results[category];
                  const categoryConfidence = items[0]?.data_confidence || 'Medium';
                  const categorySources = items.reduce((acc: number, item: any) => acc + (item.sources?.length || 0), 0);
                  const categoryMissing = items.filter((i: any) => i.data_status === 'Missing').length;

                  return (
                    <section key={category} className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-100 pb-6 gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-3xl ${categoryMissing > 0 ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {category === 'Market Sentiment' ? <Users className="w-8 h-8" /> : 
                              category === 'Product Gaps' ? <ZapIcon className="w-8 h-8" /> : 
                              <Compass className="w-8 h-8" />}
                          </div>
                          <div>
                            <h4 className="text-3xl font-black text-gray-900 tracking-tight capitalize">{category.replace(/_/g, ' ')}</h4>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Cross-channel intelligence cluster</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Cluster Quality</div>
                            <div className="mt-2 flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${categoryConfidence === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                               <span className="text-xl font-black text-gray-900">{categoryConfidence}</span>
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Sources</div>
                            <div className="mt-2 text-xl font-black text-gray-900">{categorySources}</div>
                          </div>
                        </div>
                      </div>

                      {categoryMissing > 0 && (
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {categoryMissing} missing data block{categoryMissing === 1 ? '' : 's'} flagged in this area
                        </div>
                      )}

                      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {items.map((item: any, idx: number) => {
                          const previewInsights = item.insights.slice(1, 3);
                          const hiddenInsights = item.insights.slice(3);

                          return (
                            <article
                              key={`${category}-${idx}`}
                              className={`rounded-2xl border p-5 ${item.data_status === 'Missing' ? 'bg-rose-50/80 border-rose-100' : 'bg-slate-50/80 border-gray-200'}`}
                            >
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                  <div>
                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Sub-feature</div>
                                    <h5 className="mt-2 text-lg font-bold text-gray-900">{item.sub_feature}</h5>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getConfidenceColor(item.data_confidence)}`}>
                                      {item.data_confidence || 'Unknown'} Conf
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(item.data_status)}`}>
                                      {item.data_status || 'Unknown'}
                                    </span>
                                  </div>
                                </div>

                                <div className={`rounded-2xl border p-4 ${item.data_status === 'Missing' ? 'bg-white border-rose-100' : 'bg-white border-gray-200'}`}>
                                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Key Takeaway</div>
                                  <p className="mt-3 text-sm text-gray-700 leading-7">
                                    {item.insights[0] || 'No data was surfaced for this sub-feature within the selected date range.'}
                                  </p>
                                </div>

                                {previewInsights.length > 0 && (
                                  <div className="space-y-3">
                                    {previewInsights.map((insight: string, insightIdx: number) => (
                                      <div key={insightIdx} className="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-600 leading-7">
                                        {insight}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {hiddenInsights.length > 0 && (
                                  <details className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                                    <summary className="list-none cursor-pointer text-sm font-bold text-indigo-600">
                                      View {hiddenInsights.length} more signal{hiddenInsights.length === 1 ? '' : 's'}
                                    </summary>
                                    <div className="mt-4 space-y-3">
                                      {hiddenInsights.map((insight: string, insightIdx: number) => (
                                        <div key={insightIdx} className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-gray-600 leading-7">
                                          {insight}
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                )}

                                <div className="pt-4 border-t border-gray-200/80">
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                    <span>Source type: {item.source_type || 'N/A'}</span>
                                    <span>{item.sources.length} source{item.sources.length === 1 ? '' : 's'}</span>
                                  </div>

                                  {item.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {item.sources.map((src: string, sourceIdx: number) => (
                                        <a
                                          key={sourceIdx}
                                          href={src}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase bg-white text-gray-600 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Source {sourceIdx + 1}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-3">
                {onNavigate && (
                  <button onClick={() => onNavigate('hooks', { topic: displayDomain, output_payload: { hooks: [] } })} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition shadow-sm">
                     Generate Hooks for this Trend ✨
                  </button>
                )}
                <PublishActions content={JSON.stringify(results, null, 2)} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <TrendingUp className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No active matrix</h3>
              <p className="text-sm max-w-md text-center">Configure a target domain and date range on the left to begin aggregating deep market intelligence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
