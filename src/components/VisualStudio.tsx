import { useState, useEffect, useRef } from 'react';
import { ImagePlus, Loader2, Quote, Layers, BarChart, Download, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import mermaid from 'mermaid';
import { useToast } from '../contexts/ToastContext';

export function VisualStudio(props: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { prefillData } = props;
  const { showQuotaError, showToast } = useToast();
  const [mode, setMode] = useState<'infographic' | 'carousel' | 'quote'>('infographic');
  const [topic, setTopic] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('LinkedIn');
  const chartRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if(prefillData) {
        if(prefillData.type) setMode(prefillData.type);
        if(prefillData.input) setTopic(prefillData.input);
        if(prefillData.output_payload?.output) setOutput(prefillData.output_payload.output);
     }
  }, [prefillData]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default', fontFamily: 'sans-serif' });
  }, []);

  useEffect(() => {
    if (mode === 'infographic' && typeof output === 'string' && output.includes('graph')) {
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
        mermaid.render('mermaid-chart', output).then(({ svg }) => {
          if (chartRef.current) chartRef.current.innerHTML = svg;
        });
      }
    }
  }, [output, mode]);

  const generate = async () => {
    if(!topic.trim()) return;
    setIsLoading(true); setOutput(null);
    try {
      const res = await fetch('http://localhost:3001/api/generate-visuals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: mode, input: topic, platform })
      });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      setOutput(data.output);
    } catch(e) { showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  const downloadAsset = () => {
    if (exportRef.current) {
      html2canvas(exportRef.current, { scale: 2, useCORS: true }).then((canvas) => {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url; a.download = `visual_${Date.now()}.png`; a.click();
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="bg-gradient-to-tr from-emerald-600 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3"><ImagePlus className="w-8 h-8"/> Visual Studio</h2>
            <p className="text-emerald-100 font-medium text-lg leading-relaxed max-w-xl">Generate high-converting infographics, dense carousel slides, and viral quote cards.</p>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-12 translate-x-12 pointer-events-none"></div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
           <div className="flex flex-col sm:flex-row gap-4 mb-8">
             <button onClick={()=>setMode('infographic')} className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${mode==='infographic' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}>
               <BarChart className="w-5 h-5"/> Infographic (Mermaid)
             </button>
             <button onClick={()=>setMode('carousel')} className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${mode==='carousel' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}>
               <Layers className="w-5 h-5"/> Carousel Deck Array
             </button>
             <button onClick={()=>setMode('quote')} className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${mode==='quote' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}>
               <Quote className="w-5 h-5"/> Viral Quote Card
             </button>
           </div>

           <div className="flex flex-col gap-4">
             <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Base Topic / Content</label>
                <textarea className="w-full h-24 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition placeholder-gray-400 group-hover:border-purple-300" placeholder={mode === 'infographic' ? "Explain the workflow or system you want diagrammed..." : "What is the core takeaway?"} value={topic} onChange={e=>setTopic(e.target.value)} />
             </div>
             <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Target Platform</label>
                <select className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-purple-800 bg-purple-50/50" value={platform} onChange={e=>setPlatform(e.target.value)}>
                   {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Omnichannel'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
             <button onClick={generate} disabled={isLoading || !topic.trim()} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5"/>} Render Visual
             </button>
           </div>
       </div>

       {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-emerald-500 mt-8 bg-white rounded-2xl border">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="font-bold animate-pulse">Compiling visual syntax...</p>
          </div>
       )}

       {!isLoading && output && (
          <div className="grid grid-cols-1 gap-6">
             {/* Quote Rendering */}
             {mode === 'quote' && output.quote && (
                <div className="flex flex-col items-center">
                  <div ref={exportRef} className="w-full max-w-[1080px] aspect-square bg-gradient-to-br from-gray-900 to-black text-white p-12 sm:p-24 flex flex-col justify-center items-center shadow-2xl rounded-2xl relative overflow-hidden group">
                     <Quote className="w-16 h-16 sm:w-24 sm:h-24 text-gray-700 absolute top-12 left-12 opacity-50" />
                     <h2 className="text-3xl sm:text-5xl font-serif text-center leading-tight sm:leading-snug relative z-10">"{output.quote}"</h2>
                     <div className="mt-12 flex items-center gap-4 relative z-10">
                        <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                        <span className="font-bold tracking-widest text-sm uppercase text-gray-400">{output.author}</span>
                     </div>
                  </div>
                  <button onClick={downloadAsset} className="mt-6 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 hover:bg-gray-50"><Download className="w-5 h-5"/> Download PNG Graphic</button>
                </div>
             )}

             {/* Carousel Array Rendering */}
             {mode === 'carousel' && Array.isArray(output) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {output.map((slide: any, i: number) => (
                      <div key={i} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col justify-center relative group hover:border-emerald-400 transition cursor-pointer">
                         <span className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">Slide {i+1}</span>
                         <h3 className="text-2xl font-black text-gray-900 mb-4 text-center mt-6">{slide.title}</h3>
                         <p className="text-sm font-medium text-gray-600 text-center leading-relaxed">{slide.body}</p>
                      </div>
                   ))}
                </div>
             )}

             {/* Mermaid Infographic Rendering */}
             {mode === 'infographic' && (
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                   <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                     <span className="text-sm font-bold uppercase text-gray-500 tracking-widest">Mermaid.js Compiled Syntax</span>
                     <button onClick={downloadAsset} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><Download className="w-3 h-3"/> Download Chart</button>
                   </div>
                   <div ref={exportRef} className="p-8 bg-white min-h-[400px] flex items-center justify-center">
                      <div ref={chartRef} className="w-full flex justify-center"></div>
                   </div>
                </div>
             )}
          </div>
       )}
    </div>
  );
}
