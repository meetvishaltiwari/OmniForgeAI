import { useState, useEffect } from 'react';
import { Compass, Loader2, Sparkles, TrendingUp, Grid, List as ListIcon } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function DiscoveryHub({ prefillData, onNavigate }: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { showQuotaError, showToast } = useToast();
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('LinkedIn');

  useEffect(() => {
     if(prefillData) {
        setNiche(prefillData.niche || '');
        setAudience(prefillData.audience || '');
        if(prefillData.output_payload?.output) setOutput(prefillData.output_payload.output);
     }
  }, [prefillData]);

  const discover = async (action: string) => {
    if(!niche || !audience) {
      alert("Please fill in Niche and Audience."); return;
    }
    setIsLoading(true); setOutput('');
    try {
      const res = await fetch('http://localhost:3001/api/discover', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action, niche, audience, platform }) });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      setOutput(data.output);
    } catch(e) { showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  return (
     <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3"><Compass className="w-10 h-10"/> Content Discovery Hub</h2>
            <p className="text-amber-100 font-medium text-lg max-w-2xl">Stop guessing what to post. Input your specific domain and audience, and let the AI instantly identify rising trends, weekly frameworks, and viral post ideas.</p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Your Niche / Industry</label>
                <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="e.g. B2B SaaS, Real Estate, Python Dev" value={niche} onChange={e=>setNiche(e.target.value)} />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Target Audience</label>
                <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="e.g. Founders, First-time homebuyers" value={audience} onChange={e=>setAudience(e.target.value)} />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Platform</label>
                <select className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition bg-amber-50 text-amber-800 font-semibold" value={platform} onChange={e=>setPlatform(e.target.value)}>
                   {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Omnichannel'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => discover('ideas')} disabled={isLoading} className="bg-white border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 text-amber-900 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition group shadow-sm">
                <Sparkles className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold">5 Viral Ideas</span>
              </button>
              <button onClick={() => discover('trends')} disabled={isLoading} className="bg-white border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-400 text-orange-900 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition group shadow-sm">
                <TrendingUp className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Spot Macro Trends</span>
              </button>
              <button onClick={() => discover('weekly_plan')} disabled={isLoading} className="bg-white border-2 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-400 text-yellow-900 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition group shadow-sm">
                <Grid className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Weekly Planner</span>
              </button>
           </div>
        </div>

        {isLoading && (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-amber-600 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <h3 className="font-bold text-lg animate-pulse">Scraping trends & generating strategic insights...</h3>
          </div>
        )}

        {output && !isLoading && (
          <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
             <div className="p-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2"><ListIcon className="w-4 h-4" /> AI Discovery Output</span>
                <span className="text-gray-500 text-xs">For: {niche}</span>
             </div>
             <div className="p-6 sm:p-8">
               <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-gray-200 break-words">{output}</pre>
               {onNavigate && (
                 <button onClick={() => onNavigate('campaign', { niche, audience, output_payload: output })} className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg flex items-center gap-2">
                   <Sparkles className="w-5 h-5"/> Send to Campaigns
                 </button>
               )}
             </div>
          </div>
        )}
     </div>
  );
}
