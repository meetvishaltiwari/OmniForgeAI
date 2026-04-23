import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Settings2, PenLine } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PublishActions } from './Shared';

export function PostGenerator({ prefillData, onNavigate }: { prefillData?: any, onNavigate?: (id: any, data?: any) => void }) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('General Professionals');
  const [tone, setTone] = useState('Professional & Insightful');
  const [keywords, setKeywords] = useState('');
  const [hookStyle, setHookStyle] = useState('how_to');
  const [formatTemplate, setFormatTemplate] = useState('standard');
  const [platform, setPlatform] = useState('LinkedIn');
  const [post, setPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast, showQuotaError } = useToast();

  useEffect(() => {
     if (prefillData) {
       if (prefillData.topic) setTopic(prefillData.topic);
       if (prefillData.niche) setKeywords(prefillData.niche);
     }
  }, [prefillData]);

  const generate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/generate', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ topic, audience, tone, keywords, hookStyle, formatTemplate, platform, cta: '' }) });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      setPost(data.post);
    } catch(e){ showToast('Server unreachable. Check if backend is running.', 'error'); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3"><PenLine className="w-8 h-8"/> Post Draft Engine</h2>
              <p className="text-blue-100 font-medium text-lg leading-relaxed">Turn disorganized thoughts into elite tier LinkedIn copy structured with proven storytelling hooks.</p>
            </div>
            <div className="hidden md:flex justify-end opacity-20 relative">
               <Sparkles className="w-32 h-32 absolute -right-4 -top-8 animate-pulse" />
            </div>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Core Topic</label>
                   <textarea className="w-full h-32 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-sans text-sm shadow-inner resize-none" placeholder="What specific idea, story, or lesson do you want to share today?" value={topic} onChange={e=>setTopic(e.target.value)} />
                   {onNavigate && !topic && (
                      <button onClick={() => onNavigate('hooks')} className="w-full mt-3 bg-amber-50 text-amber-700 py-3 rounded-xl text-sm font-semibold hover:bg-amber-100 transition shadow-sm border border-amber-200 flex justify-center items-center gap-2">
                        <Sparkles className="w-4 h-4"/> Stuck on the intro? Generate 5 viral hooks
                      </button>
                   )}
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-2 mt-4 flex items-center gap-2"><Settings2 className="w-4 h-4"/> Advanced Settings</label>
                   <div className="grid grid-cols-2 gap-4">
                     <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" value={audience} onChange={e=>setAudience(e.target.value)}>
                        <option>General Professionals</option><option>Founders & Execs</option><option>Engineers</option><option>Marketers</option>
                     </select>
                     <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" value={tone} onChange={e=>setTone(e.target.value)}>
                        <option>Professional & Insightful</option><option>Witty & Casual</option><option>Contrarian</option><option>Vulnerable Story</option>
                     </select>
                     <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" value={hookStyle} onChange={e=>setHookStyle(e.target.value)}>
                        <option value="how_to">How-To Hook</option><option value="vulnerable">Vulnerable Hook</option><option value="stats">Statistical Shock Hook</option><option value="contra">Contrarian Hook</option>
                     </select>
                     <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" value={formatTemplate} onChange={e=>setFormatTemplate(e.target.value)}>
                        <option value="standard">Standard Format</option><option value="listicle">Listicle Format</option><option value="story">Story Format</option><option value="step_by_step">Step-by-Step</option>
                     </select>
                     <select className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" value={platform} onChange={e=>setPlatform(e.target.value)}>
                        {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Omnichannel'].map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                   </div>
                </div>
                <button onClick={generate} disabled={isLoading || !topic.trim()} className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold text-lg hover:bg-black transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-60">
                   {isLoading ? <Loader2 className="w-6 h-6 animate-spin"/> : <Sparkles className="w-6 h-6"/>}
                   {isLoading ? 'Drafting & Editing...' : 'Generate Elite Draft'}
                </button>
             </div>

             <div className="border-l border-gray-100 lg:pl-8 flex flex-col h-full min-h-[400px]">
                {post ? (
                   <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col h-full">
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                         <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded tracking-wide mb-4 inline-block uppercase">Final Draft</span>
                         <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-gray-800 break-words">{post}</pre>
                      </div>
                       <div className="mt-4 flex flex-col gap-2">
                          <PublishActions content={post} />
                          {onNavigate && post.length > 400 && !post.includes('\n') && (
                              <button onClick={() => onNavigate('rewriter', { draft: post, instruction: 'Re-format to make it scannable' })} className="w-full text-left bg-orange-50 text-orange-700 border border-orange-200 p-3 rounded-lg text-xs font-bold hover:bg-orange-100 transition mt-2">
                                 Alert: Social platforms favor scannable formats. Fast-pass through the Refiner?
                              </button>
                          )}
                          {onNavigate && (/\d+[\.\)]/.test(post) || /- /.test(post)) && (
                              <button onClick={() => onNavigate('visuals', { type: 'carousel', input: post })} className="w-full text-left bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-xs font-bold hover:bg-emerald-100 transition">
                                 This framework would perform 40% better natively as a Carousel. Generate Visuals in Studio?
                              </button>
                          )}
                       </div>
                   </div>
                ) : (
                   <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center h-full text-gray-400">
                     <PenLine className="w-12 h-12 mb-4 text-gray-300" />
                     <p className="font-semibold px-8">Your highly polished draft will appear here. The Agent handles the hook logic, whitespace editing, and cliche removal automatically.</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
