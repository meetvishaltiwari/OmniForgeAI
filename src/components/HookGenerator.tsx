import { useState, useEffect } from 'react';
import { Lightbulb, Loader2, Target, CheckCircle2, ChevronDown, Wand2, Activity, Play, Zap } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function HookGenerator({ prefillData, onNavigate }: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { showQuotaError, showToast } = useToast();
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('Engage');
  const [hooks, setHooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refiningStates, setRefiningStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
     if(prefillData) {
        setTopic(prefillData.topic || '');
        setNiche(prefillData.niche || '');
        setAudience(prefillData.audience || '');
        if(prefillData.output_payload?.hooks) {
           const initialHooks = prefillData.output_payload.hooks.map((h: any) => ({
              ...h,
              original: h.hook,
              activeText: h.hook,
              showVariations: false
           }));
           setHooks(initialHooks);
        }
     }
  }, [prefillData]);

  const generate = async () => {
    if(!topic || !audience) {
      alert("Please fill in Topic and Audience."); return;
    }
    setIsLoading(true); setHooks([]);
    try {
      const res = await fetch('http://localhost:3001/api/generate-hooks', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ topic, niche, audience, goal }) });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      
      const enriched = data.hooks.map((h: any) => ({
        ...h,
        original: h.hook,
        activeText: h.hook,
        showVariations: false
      }));
      setHooks(enriched);
    } catch(e) { showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  const refineHook = async (index: number, type: string) => {
     const hook = hooks[index];
     setRefiningStates(prev => ({...prev, [index]: true}));
     try {
       const res = await fetch('http://localhost:3001/api/iterate', {
         method: 'POST', headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ draft: hook.activeText, instruction: `Refine this hook. Focus: ${type}` })
       });
       const data = await res.json();
       if(data.post) {
          const next = [...hooks];
          next[index].activeText = data.post;
          setHooks(next);
       }
     } catch(e) {} finally {
       setRefiningStates(prev => ({...prev, [index]: false}));
     }
  };

  const toggleVariations = (index: number) => {
    const next = [...hooks];
    next[index].showVariations = !next[index].showVariations;
    setHooks(next);
  };

  const setVariation = (index: number, text: string) => {
    const next = [...hooks];
    next[index].activeText = text;
    setHooks(next);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3"><Target className="w-10 h-10"/> Viral Hook Architect</h2>
            <p className="text-amber-50 font-medium text-lg max-w-2xl">Stop the scroll in 0.5 seconds. Generate 5 high-impact hooks using proven psychological triggers like curiosity gaps, micro-narratives, and pattern interrupts.</p>
          </div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-2">
                 <label className="block text-xs font-bold uppercase text-gray-500 mb-2">The Big Idea / Topic</label>
                 <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-semibold" placeholder="e.g. Why most founders fail at hiring" value={topic} onChange={e=>setTopic(e.target.value)} />
              </div>
              <div>
                 <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Target Audience</label>
                 <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-semibold" placeholder="e.g. Early-stage Founders" value={audience} onChange={e=>setAudience(e.target.value)} />
              </div>
              <div>
                 <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Campaign Goal</label>
                 <select className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition bg-amber-50 text-amber-800 font-bold" value={goal} onChange={e=>setGoal(e.target.value)}>
                    <option>Engage</option><option>Convert</option><option>Challenge</option><option>Educate</option>
                 </select>
              </div>
           </div>
           
           <button onClick={generate} disabled={isLoading || !topic || !audience} className="w-full bg-gray-900 text-white p-5 rounded-xl font-black text-xl hover:bg-black transition flex justify-center items-center gap-3 shadow-xl disabled:opacity-60">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin"/> : <Target className="w-6 h-6"/>}
              Architect 5 Hooks
           </button>
       </div>

       {isLoading && (
          <div className="flex flex-col items-center justify-center p-16 text-amber-500 mt-8">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="font-bold animate-pulse">Engineering 5 psychological perspectives...</p>
          </div>
       )}

       {!isLoading && hooks.length > 0 && (
          <div className="space-y-6 mt-8">
             {hooks.map((hook, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:border-amber-400 transition hover:shadow-md">
                   {/* Tags Bar */}
                   <div className="bg-amber-50 border-b border-amber-100 p-3 sm:px-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide">
                      <span className="bg-amber-200 text-amber-900 px-2 py-1 rounded shadow-sm flex items-center gap-1"><Zap className="w-3 h-3"/> {hook.format}</span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded shadow-sm flex items-center gap-1"><Target className="w-3 h-3"/> Trigger: {hook.trigger}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded shadow-sm flex items-center gap-1"><Play className="w-3 h-3"/> Intent: {hook.intent}</span>
                   </div>

                   <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                         <div className="flex-1">
                            <p className="text-gray-900 font-bold leading-relaxed text-xl mb-4 whitespace-pre-wrap">{hook.activeText}</p>
                            
                            {/* Refinements */}
                            <div className="flex flex-wrap gap-2 mb-4">
                               <button onClick={() => refineHook(i, 'contrarian')} disabled={refiningStates[i]} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition disabled:opacity-50">Make Contrarian</button>
                               <button onClick={() => refineHook(i, 'curiosity')} disabled={refiningStates[i]} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition disabled:opacity-50">Increase Curiosity</button>
                               <button onClick={() => refineHook(i, 'shorten')} disabled={refiningStates[i]} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition disabled:opacity-50">Shorten</button>
                               <button onClick={() => refineHook(i, 'aggressive')} disabled={refiningStates[i]} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition disabled:opacity-50">Make Aggressive</button>
                               {refiningStates[i] && <Loader2 className="w-4 h-4 text-amber-500 animate-spin self-center" />}
                            </div>

                            <button onClick={() => toggleVariations(i)} className="text-amber-600 text-sm font-bold flex items-center gap-1 hover:text-amber-800 transition">
                               {hook.showVariations ? 'Hide Variations' : 'Show Variations'} <ChevronDown className={`w-4 h-4 transition-transform ${hook.showVariations ? 'rotate-180' : ''}`}/>
                            </button>

                            {hook.showVariations && hook.variations && (
                               <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                                  <div onClick={() => setVariation(i, hook.variations.short)} className="cursor-pointer group">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Short Variant</span>
                                     <p className="text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition">{hook.variations.short}</p>
                                  </div>
                                  <div onClick={() => setVariation(i, hook.variations.aggressive)} className="cursor-pointer group">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Aggressive Variant</span>
                                     <p className="text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition">{hook.variations.aggressive}</p>
                                  </div>
                                  <div onClick={() => setVariation(i, hook.variations.curiosity_max)} className="cursor-pointer group">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Curiosity Max</span>
                                     <p className="text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition">{hook.variations.curiosity_max}</p>
                                  </div>
                                  <div onClick={() => setVariation(i, hook.original)} className="cursor-pointer group">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Original</span>
                                     <p className="text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition">{hook.original}</p>
                                  </div>
                               </div>
                            )}

                         </div>

                         {/* Scores */}
                         <div className="w-full lg:w-48 bg-gray-50 rounded-xl p-4 border border-gray-100 h-fit self-start shrink-0">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 text-center flex items-center justify-center gap-1"><Activity className="w-3 h-3"/> AI Scoring</span>
                            <div className="space-y-3">
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>Scroll Stop</span> <span>{hook.scores?.scrollStop || 8}/10</span></div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${(hook.scores?.scrollStop || 8)*10}%`}}></div></div>
                               </div>
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>Curiosity</span> <span>{hook.scores?.curiosity || 9}/10</span></div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${(hook.scores?.curiosity || 9)*10}%`}}></div></div>
                               </div>
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>Clarity</span> <span>{hook.scores?.clarity || 7}/10</span></div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: `${(hook.scores?.clarity || 7)*10}%`}}></div></div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="border-t border-gray-100 bg-gray-50 p-4 sm:px-6 flex items-center justify-end">
                     {onNavigate && (
                       <button onClick={() => onNavigate('generator', { topic: hook.activeText, audience, tone, hookStyle: hook.format })} className="text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-xl transition shadow-md flex items-center gap-2">Draft Post <Wand2 className="w-4 h-4"/></button>
                     )}
                   </div>
                </div>
             ))}
          </div>
       )}
    </div>
  );
}
