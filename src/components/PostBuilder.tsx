import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Lightbulb, Target, BookOpen, PenTool, Sparkles, CheckCircle2, Wand2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PublishActions } from './Shared';

export function PostBuilder({ prefillData, onNavigate }: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { showToast, showQuotaError } = useToast();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [angle, setAngle] = useState('Data-driven / Numbers-first');
  const [evidence, setEvidence] = useState('Statistics');
  const [audience, setAudience] = useState('General Professionals');
  const [tone, setTone] = useState('Insightful & Value-Driven');

  const [hooks, setHooks] = useState<any[]>([]);
  const [selectedHookText, setSelectedHookText] = useState('');
  const [refiningStates, setRefiningStates] = useState<Record<number, boolean>>({});

  const [draftBody, setDraftBody] = useState('');
  const [finalPost, setFinalPost] = useState('');
  const [ctaStyle, setCtaStyle] = useState('Ask a Question');
  const [ctas, setCtas] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);

  useEffect(() => {
    if(prefillData) {
       if(prefillData.idea) setIdea(prefillData.idea);
       if(prefillData.audience) setAudience(prefillData.audience);
       if(prefillData.tone) setTone(prefillData.tone);
       if(prefillData.platform) setPlatform(prefillData.platform);
       if(prefillData.output_payload?.post) {
          setFinalPost(prefillData.output_payload.post);
          setStep(5);
       }
    }
  }, [prefillData]);

  const handleNextAngles = () => setStep(2);

  const handleNextHooks = async () => {
    setIsLoading(true); setHooks([]);
    try {
      const res = await fetch('http://localhost:3001/api/generate-hooks', { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ topic: idea, audience, platform }) 
      });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      
      const enriched = data.hooks.map((h: any) => ({
        ...h,
        activeText: h.hook,
        original: h.hook
      }));
      setHooks(enriched);
      setStep(3);
    } catch(e) { showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  const refineHookInline = async (index: number, type: string) => {
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
         if(selectedHookText === hook.activeText) setSelectedHookText(data.post);
      }
    } catch(e) {} finally {
      setRefiningStates(prev => ({...prev, [index]: false}));
    }
  };

  const handleNextBody = async () => {
    setIsLoading(true); setDraftBody('');
    try {
       const res = await fetch('http://localhost:3001/api/generate', {
         method: 'POST', headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ 
           topic: idea, audience, platform, hookStyle: selectedHookText, 
           formatTemplate: angle, tone, cta: 'LEAVE_EMPTY' 
         })
       });
       const data = await res.json();
       setDraftBody(data.post);
       setStep(4);
    } catch(e) {} finally { setIsLoading(false); }
  };

  const handleNextPolish = async () => {
    setIsLoading(true);
    try {
       const res = await fetch('http://localhost:3001/api/iterate', {
         method: 'POST', headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ draft: draftBody, instruction: `Finalize the post. Style: ${ctaStyle}. Ensure scannability.` })
       });
       const data = await res.json();
       setFinalPost(data.post);
       setCtas(data.ctas || []);
       setHashtags(data.hashtags || []);
       setStep(5);
    } catch(e) {} finally { setIsLoading(false); }
  };

  const applyCTA = (cta: string) => setFinalPost(prev => prev + '\n\n' + cta);
  const applyHashtags = (tags: string[]) => setFinalPost(prev => prev + '\n\n' + tags.join(' '));

  return (
    <div className="w-full max-w-4xl mx-auto py-10">
      
      {/* Step 1: Core Idea */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 slide-in-from-bottom animate-in fade-in duration-300">
           <div className="flex items-center gap-3 border-b pb-4">
              <Lightbulb className="w-6 h-6 text-indigo-500" />
              <h3 className="text-2xl font-black text-gray-800">1. Define the Core Idea</h3>
           </div>
           
           <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Primary Post Concept</label>
                <textarea className="w-full h-32 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm shadow-inner resize-none" placeholder="What's the raw lesson or story?" value={idea} onChange={e=>setIdea(e.target.value)} />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold" value={audience} onChange={e=>setAudience(e.target.value)}>
                   {['General Professionals', 'Founders & Execs', 'Engineers', 'Marketers'].map(o => <option key={o}>{o}</option>)}
                </select>
                <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold" value={platform} onChange={e=>setPlatform(e.target.value)}>
                   {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Omnichannel'].map(o => <option key={o}>{o}</option>)}
                </select>
             </div>
           </div>

           <div className="flex justify-end pt-4">
             <button onClick={handleNextAngles} disabled={isLoading || !idea.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition transform hover:-translate-y-1">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Continue to Angle'} <ArrowRight className="w-5 h-5"/>
             </button>
           </div>
        </div>
      )}

      {/* Step 2: Angles */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 slide-in-from-bottom animate-in fade-in duration-300">
           <div className="flex items-center gap-3 border-b pb-4">
              <Target className="w-6 h-6 text-rose-500" />
              <h3 className="text-2xl font-black text-gray-800">2. Determine the Approach</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Content Angle</label>
                <select className="w-full border border-gray-300 p-4 rounded-xl text-gray-800 bg-gray-50/50" value={angle} onChange={e=>setAngle(e.target.value)}>
                   {['Data-driven / Numbers-first', 'Contrarian', 'How-to / Educational', 'Personal Story', 'Case Study', 'Opinion', 'Framework', 'Mistake / Lesson', 'Trend Breakdown', 'Comparison', 'Myth-busting'].map(o => <option key={o}>{o}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Evidence Style</label>
                <select className="w-full border border-gray-300 p-4 rounded-xl text-gray-800 bg-gray-50/50" value={evidence} onChange={e=>setEvidence(e.target.value)}>
                   {['Statistics', 'Benchmarks', 'Research', 'Personal Metrics', 'Case Study', 'Observation', 'Anecdotal', 'Opinion Only'].map(o => <option key={o}>{o}</option>)}
                </select>
             </div>
           </div>

           <div className="flex justify-end pt-4">
             <button onClick={handleNextHooks} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition transform hover:-translate-y-1">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Generate Hook Intelligence'} <ArrowRight className="w-5 h-5"/>
             </button>
           </div>
        </div>
      )}

      {/* Step 3: Hooks */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 slide-in-from-bottom animate-in fade-in duration-300">
           <div className="flex items-center gap-3 border-b pb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h3 className="text-2xl font-black text-gray-800">3. Select the Hook</h3>
           </div>
           
           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
             {hooks.map((hook, i) => (
               <div key={i} onClick={() => setSelectedHookText(hook.activeText)} className={`p-6 rounded-xl border-2 cursor-pointer transition ${selectedHookText === hook.activeText ? 'border-indigo-500 bg-indigo-50 shadow-md ring-4 ring-indigo-500/20' : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'}`}>
                  <div className="flex flex-wrap gap-2 mb-3">
                     <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-black px-2 py-1 rounded">{hook.format}</span>
                     <span className="bg-rose-100 text-rose-800 text-[10px] uppercase font-black px-2 py-1 rounded">{hook.trigger}</span>
                     <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black px-2 py-1 rounded">Score: {hook.scores?.scrollStop}/10</span>
                  </div>
                  <p className="text-gray-900 font-bold leading-relaxed text-lg whitespace-pre-wrap">{hook.activeText}</p>
                  
                  {/* Inline Refinements if selected */}
                  {selectedHookText === hook.activeText && (
                     <div className="mt-4 pt-4 border-t border-indigo-200 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => refineHookInline(i, 'contrarian')} disabled={refiningStates[i]} className="text-xs bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded cursor-pointer">Make Contrarian</button>
                        <button onClick={() => refineHookInline(i, 'curiosity')} disabled={refiningStates[i]} className="text-xs bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded cursor-pointer">More Curious</button>
                        <button onClick={() => refineHookInline(i, 'shorten')} disabled={refiningStates[i]} className="text-xs bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded cursor-pointer">Shorten</button>
                        <button onClick={() => refineHookInline(i, 'aggressive')} disabled={refiningStates[i]} className="text-xs bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded cursor-pointer">Aggressive</button>
                        {refiningStates[i] && <Loader2 className="w-4 h-4 animate-spin text-indigo-500 ml-2 mt-1"/>}
                     </div>
                  )}
               </div>
             ))}
           </div>
           
           <div className="flex justify-end pt-4">
             <button onClick={handleNextBody} disabled={isLoading || !selectedHookText} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition transform hover:-translate-y-1">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Draft Body'} <ArrowRight className="w-5 h-5"/>
             </button>
           </div>
        </div>
      )}

      {/* Step 4: Body Draft */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 slide-in-from-bottom animate-in fade-in duration-300">
           <div className="flex items-center gap-3 border-b pb-4">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              <h3 className="text-2xl font-black text-gray-800">4. Structure & Polish the Body</h3>
           </div>
           
           <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mb-4">
             <span className="text-[10px] font-black uppercase text-gray-400 block mb-2">Locked Hook</span>
             <p className="font-bold text-gray-700 whitespace-pre-wrap">{selectedHookText}</p>
           </div>
           
           <textarea className="w-full min-h-[300px] border border-gray-300 p-6 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-sans text-[15px] leading-loose text-gray-800 bg-white" value={draftBody} onChange={e => setDraftBody(e.target.value)} />
           
           <div className="flex justify-end pt-4">
             <button onClick={handleNextPolish} disabled={isLoading || !draftBody.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition transform hover:-translate-y-1">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Add CTAs & Finish'} <ArrowRight className="w-5 h-5"/>
             </button>
           </div>
        </div>
      )}

      {/* Step 5: Final Polish */}
      {step === 5 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 slide-in-from-bottom animate-in fade-in duration-300">
           <div className="flex flex-col lg:flex-row gap-8">
             <div className="flex-1 space-y-4">
               <div className="flex items-center gap-3 border-b pb-4 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-2xl font-black text-gray-800">5. Final Preview</h3>
               </div>
               
               <div className="flex items-center gap-4 mb-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                 <label className="text-sm font-bold text-gray-600 uppercase">CTA Style:</label>
                 <select className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-800 bg-white shadow-sm" value={ctaStyle} onChange={e=>{setCtaStyle(e.target.value); handleNextPolish();}}>
                   {['Ask a Question', 'Invite Opinions', 'Ask for Experience', 'Save/Share CTA', 'Soft CTA', 'No CTA'].map(o => <option key={o}>{o}</option>)}
                 </select>
               </div>

               <textarea className="w-full min-h-[400px] border border-gray-300 p-6 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-sans text-[15px] leading-loose text-gray-900 bg-white shadow-inner" value={finalPost} onChange={e => setFinalPost(e.target.value)} />
               <div className="flex flex-col sm:flex-row items-center gap-4 justify-between mt-4">
                 <PublishActions content={finalPost} />
                 {onNavigate && (
                   <button onClick={() => onNavigate('rewriter', { draft: finalPost })} className="bg-pink-100/50 hover:bg-pink-100 text-pink-700 font-bold px-6 py-2 rounded-xl border border-pink-200 transition shadow-sm flex items-center gap-2">
                     <Wand2 className="w-4 h-4"/> AI Refine & Rewrite
                   </button>
                 )}
               </div>
             </div>

             <div className="w-full lg:w-80 space-y-6">
               <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <h4 className="font-bold text-indigo-900 text-sm mb-3 uppercase tracking-wide">Suggested CTAs</h4>
                  <div className="space-y-2">
                    {ctas.map((cta, i) => (
                      <div key={i} onClick={() => applyCTA(cta)} className="bg-white p-3 rounded-lg border border-indigo-100 text-sm cursor-pointer hover:border-indigo-400 hover:shadow-sm transition">
                        {cta}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                  <h4 className="font-bold text-amber-900 text-sm mb-3 uppercase tracking-wide">Suggested Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, i) => (
                      <span key={i} className="bg-white px-2 py-1 rounded text-xs font-bold border border-amber-200 text-amber-800">{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => applyHashtags(hashtags)} className="w-full mt-3 bg-white text-xs font-bold text-amber-700 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition">Append All to Post</button>
               </div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
