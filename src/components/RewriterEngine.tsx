import { useState, useEffect } from 'react';
import { PenTool, Loader2, IterationCcw, Wand2, History, Layers } from 'lucide-react';
import { PublishActions } from './Shared';
import { useToast } from '../contexts/ToastContext';

export function RewriterEngine(props: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { prefillData } = props;
  const { showQuotaError, showToast } = useToast();
  const [draft, setDraft] = useState('');
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('LinkedIn');

  useEffect(() => {
     if(prefillData) {
        setDraft(prefillData.draft || '');
        setInstruction(prefillData.instruction || '');
        if(prefillData.output_payload?.post) setResult(prefillData.output_payload.post);
     }
  }, [prefillData]);

  const rewrite = async () => {
    if(!draft.trim() || !instruction.trim()) return;
    setIsLoading(true); setResult('');
    try {
      const res = await fetch('http://localhost:3001/api/rewrite', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ draft, instruction, platform }) });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      setResult(data.post);
    } catch(e){ showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3"><PenTool className="w-8 h-8 text-indigo-400"/> Strict Editor</h2>
              <p className="text-gray-400 font-medium text-lg leading-relaxed">Paste an awful rough draft, a clunky AI output, or some messy notes. Tell the Editor what to fix.</p>
            </div>
            <div className="hidden md:flex justify-end opacity-20 relative">
               <History className="w-32 h-32 absolute -right-4 -top-8 animate-reverse-spin" />
            </div>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Original Copy</label>
                   <textarea className="w-full h-48 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm shadow-inner resize-none text-gray-700 bg-gray-50 bg-opacity-50" placeholder="Paste your draft here..." value={draft} onChange={e=>setDraft(e.target.value)} />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-indigo-500 mb-2 flex items-center gap-2"><Wand2 className="w-4 h-4"/> Editorial Instruction</label>
                   <input className="w-full border border-indigo-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition font-semibold text-lg text-indigo-900 bg-indigo-50/30" placeholder="e.g. Make it punchier, remove cliches, and add line breaks" value={instruction} onChange={e=>setInstruction(e.target.value)} onKeyDown={e=> e.key === 'Enter' && rewrite()} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-indigo-500 mb-2 flex items-center gap-2 mt-4"><Layers className="w-4 h-4"/> Target Platform</label>
                    <select className="w-full border border-indigo-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition font-semibold text-lg text-indigo-900 bg-indigo-50/30 mb-2" value={platform} onChange={e=>setPlatform(e.target.value)}>
                      {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Omnichannel'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                 </div>
                
                <div className="flex gap-2 pb-4 overflow-x-auto">
                   <button onClick={()=>setInstruction('Make it 50% shorter and punchier')} className="whitespace-nowrap text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition">Make Shorter</button>
                   <button onClick={()=>setInstruction('Remove all AI sounding fluff, words like tapestry, delve, and enhance.')} className="whitespace-nowrap text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition">De-Fluff</button>
                   <button onClick={()=>setInstruction('Rewrite this in a highly contrarian, assertive tone.')} className="whitespace-nowrap text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition">Go Contrarian</button>
                </div>
                
                <button onClick={rewrite} disabled={isLoading || !draft.trim() || !instruction.trim()} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-60">
                   {isLoading ? <Loader2 className="w-6 h-6 animate-spin"/> : <IterationCcw className="w-6 h-6"/>}
                   Rewrite & Polish
                </button>
             </div>

             <div className="border border-indigo-100 bg-indigo-50/10 rounded-xl flex flex-col h-full overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 font-black text-xs text-indigo-800 uppercase tracking-widest text-center">Final Output</div>
                {result ? (
                   <div className="flex-1 p-6 flex flex-col justify-between">
                      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-gray-900 break-words mb-6">{result}</pre>
                      <PublishActions content={result} />
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-indigo-300">
                     {isLoading ? <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-400" /> : <PenTool className="w-10 h-10 mb-4 opacity-50" />}
                     <p className="font-medium text-sm">{isLoading ? 'Editor is actively rewriting...' : 'Your rewritten masterpiece will appear here.'}</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
