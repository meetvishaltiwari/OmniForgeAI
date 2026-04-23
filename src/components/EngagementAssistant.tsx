import { useState, useEffect } from 'react';
import { MessageCircle, Loader2, Send, Filter, Users } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function EngagementAssistant(props: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { prefillData } = props;
  const { showQuotaError, showToast } = useToast();
  const [mode, setMode] = useState<'comment' | 'reply' | 'feed_analyzer'>('comment');
  const [content, setContent] = useState('');
  const [tone, setTone] = useState('Insightful & Value-Driven');
  const [niche, setNiche] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('LinkedIn');

  useEffect(() => {
     if(prefillData) {
        if(prefillData.type) setMode(prefillData.type);
        if(prefillData.content) setContent(prefillData.content);
        if(prefillData.tone) setTone(prefillData.tone);
        if(prefillData.niche) setNiche(prefillData.niche);
        if(prefillData.output_payload?.output) setOutput(prefillData.output_payload.output);
     }
  }, [prefillData]);

  const generate = async () => {
    if(!content.trim()) return;
    setIsLoading(true); setOutput('');
    try {
      const res = await fetch('http://localhost:3001/api/generate-engagement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: mode, content, tone, niche, platform })
      });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      setOutput(data.output);
    } catch(e) { showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="bg-gradient-to-tr from-teal-600 to-cyan-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3"><MessageCircle className="w-8 h-8"/> Engage Agent</h2>
              <p className="text-teal-100 font-medium text-lg leading-relaxed">Ghostwrite 1% tier comments that steal the spotlight, or automatically analyze messy feed dumps for high-ROI networking targets.</p>
            </div>
            <div className="hidden md:flex justify-end opacity-20 relative">
               <Users className="w-32 h-32 absolute -right-4 -top-8 animate-pulse" />
            </div>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
           <div className="flex flex-col sm:flex-row gap-4 mb-8">
             <button onClick={()=>setMode('comment')} className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${mode==='comment' ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}>
               Comment Ghostwriter
             </button>
             <button onClick={()=>setMode('reply')} className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${mode==='reply' ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}>
               DM / Reply Engine
             </button>
             <button onClick={()=>setMode('feed_analyzer')} className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${mode==='feed_analyzer' ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}>
               <Filter className="w-5 h-5"/> Feed Target Analyzer
             </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                 {mode === 'feed_analyzer' && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Target Niche</label>
                      <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-semibold" placeholder="e.g. Series A Founders" value={niche} onChange={e=>setNiche(e.target.value)} />
                    </div>
                 )}

                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                       {mode === 'feed_analyzer' ? 'Raw Feed Dump (Ctrl+A, Ctrl+C your feed)' : 'Target Post / Message Content'}
                    </label>
                    <textarea className="w-full h-32 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-sans text-sm shadow-inner resize-none" placeholder="Paste context here..." value={content} onChange={e=>setContent(e.target.value)} />
                 </div>

                 {mode !== 'feed_analyzer' && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ghostwriter Tone</label>
                      <select className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-semibold" value={tone} onChange={e=>setTone(e.target.value)}>
                         <option>Insightful & Value-Driven</option>
                         <option>Witty & Playful</option>
                         <option>Contrarian & Bold</option>
                         <option>Extremely Professional</option>
                      </select>
                    </div>
                 )}

                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Target Platform</label>
                    <select className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition text-teal-800 font-semibold bg-teal-50/50 mb-4" value={platform} onChange={e=>setPlatform(e.target.value)}>
                       {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Omnichannel'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                 </div>

                 <button onClick={generate} disabled={isLoading || !content.trim()} className="w-full bg-teal-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition flex justify-center items-center gap-2 shadow-lg shadow-teal-600/30 disabled:opacity-60">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                    {mode === 'feed_analyzer' ? 'Analyze Targets' : 'Ghostwrite Comment'}
                 </button>
              </div>

              <div className="border border-teal-100 bg-teal-50/10 rounded-xl flex flex-col h-full overflow-hidden min-h-[300px]">
                 <div className="bg-teal-50 border-b border-teal-100 px-4 py-3 font-black text-xs text-teal-800 uppercase tracking-widest text-center">Output</div>
                 {output ? (
                    <div className="flex-1 p-6 overflow-y-auto">
                       <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-gray-800 break-words">{output}</pre>
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-teal-300">
                      {isLoading ? <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-400" /> : <MessageCircle className="w-10 h-10 mb-4 opacity-50" />}
                      <p className="font-medium text-sm">{isLoading ? 'AI is processing content...' : 'Engagement output will render here.'}</p>
                    </div>
                 )}
              </div>
           </div>
       </div>
    </div>
  );
}
