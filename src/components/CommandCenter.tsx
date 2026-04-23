import { useState, useEffect } from 'react';
import { Lightbulb, Settings, Loader2 } from 'lucide-react';

export function CommandCenter({ prefillData, onNavigate }: { prefillData?: any, onNavigate?: (target: string, data?: any) => void }) {
  const [queue, setQueue] = useState<any[]>([]);
  const [insights, setInsights] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState('All Platforms');
  const [isLoading, setIsLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/queue');
      const data = await response.json();
      setQueue(data.items || []);
    } catch (e) { console.error("Error fetching queue", e); }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!prefillData) return;
    if (prefillData.audience) setAudience(prefillData.audience);
    if (prefillData.platform) setPlatform(prefillData.platform);
    if (prefillData.output_payload?.insights) setInsights(prefillData.output_payload.insights);
  }, [prefillData]);

  const getInsights = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, platform })
      });
      const data = await response.json();
      setInsights(data.insights);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">Smart Insights</h2>
          <form onSubmit={getInsights} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <input type="text" required value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="E.g., Senior DevOps Engineers" className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-rose-600 outline-none text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Platform(s)</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-rose-600 outline-none text-sm bg-white">
                 <option value="All Platforms">All Platforms</option>
                 <option value="LinkedIn">LinkedIn</option>
                 <option value="Meta (Facebook, Instagram)">Meta (Facebook, Instagram)</option>
                 <option value="X (Twitter)">X (Twitter)</option>
                 <option value="TikTok">TikTok</option>
                 <option value="YouTube">YouTube</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />} Calculate Best Times
            </button>
          </form>
          {insights && <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-lg text-sm text-gray-800 leading-relaxed font-medium">{insights}</div>}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><Settings className="w-5 h-5 text-gray-500" /> API Settings</h3>
           <p className="text-xs text-gray-500 mb-4 leading-relaxed">Simulated queue processor running in server.js.</p>
           <div className="bg-green-50 text-green-700 font-mono text-xs p-2 rounded border border-green-200">Worker Status: ACTIVE</div>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
          <div className="border-b border-gray-100 p-4 font-semibold text-gray-700 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <span>Publishing Queue</span>
            <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-full">{queue.filter(q => q.status === 'pending').length} Pending</span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50 space-y-4">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm text-center">
                <p className="text-gray-500 mb-4 font-medium">Your calendar is empty.</p>
                {onNavigate && (
                  <button onClick={() => onNavigate('discover')} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors shadow-sm">
                     Discover trending topics to write about now ✨
                  </button>
                )}
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className={`p-4 rounded-xl border ${item.status === 'published' ? 'bg-white border-gray-200 opacity-60' : 'bg-white border-rose-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${item.status === 'published' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'} `}>{item.status}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">Target: {new Date(item.scheduleFor).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed font-medium">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
