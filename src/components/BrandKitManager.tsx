import { useState, useEffect } from 'react';
import { Palette, Loader2, Globe, Plus, Trash2, CheckCircle2, Type, Building2, PaintBucket, Users } from 'lucide-react';

export function BrandKitManager() {
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [domainStatus, setDomainStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  
  const [view, setView] = useState<'list' | 'create'>('list');
  
  // Create Form State
  const [domain, setDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandStory, setBrandStory] = useState('');
  const [logo, setLogo] = useState('');
  const [colors, setColors] = useState({ primary: '#000000', secondary: '#ffffff', accent: '#3b82f6' });
  const [fonts, setFonts] = useState<string[]>([]);
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General Professionals');
  const [contentPillars, setContentPillars] = useState<string[]>(['Growth', 'Leadership']);
  const [ctaStyle, setCtaStyle] = useState('Click the link below');
  
  const [aiControls, setAiControls] = useState({ creativity: 50, virality: 50, contrarian: 10 });

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/brand_kits');
      const data = await res.json();
      if(Array.isArray(data)) setKits(data);
    } catch(e) {}
  };

  const syncBrandFetch = async () => {
    if(!domain) return;
    setDomainStatus('loading');
    try {
      const res = await fetch('http://localhost:3001/api/brandfetch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      
      if(data.name) setBrandName(data.name);
      if(data.description) setBrandStory(data.description);
      
      const logos = data.logos || [];
      if(logos.length > 0) setLogo(logos[0].formats?.[0]?.src || '');
      
      const brandColors = data.colors || [];
      if(brandColors.length > 0) {
        setColors(prev => ({
           ...prev,
           primary: brandColors[0]?.hex || prev.primary,
           secondary: brandColors[1]?.hex || prev.secondary,
           accent: brandColors[2]?.hex || prev.accent
        }));
      }
      
      const brandFonts = data.fonts || [];
      if(brandFonts.length > 0) {
        setFonts(brandFonts.map((f:any) => f.name));
      }
      
      setDomainStatus('success');
    } catch(e) {
      console.warn("BrandFetch missed. Falling back to manual.");
      setDomainStatus('error');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { brandName, domain, logo, colors, fonts, tone, audience, brandStory, contentPillars, ctaStyle, aiControls };
      const res = await fetch('http://localhost:3001/api/brand_kits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!res.ok) {
        const error = await res.json();
        alert(error.error);
      } else {
        setView('list');
        fetchKits();
        // Reset form...
        setDomain(''); setBrandName(''); setLogo(''); setDomainStatus('');
      }
    } catch(e) {} finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/api/brand_kits/${id}`, { method: 'DELETE' });
      fetchKits();
    } catch(e) {}
  };

  if(view === 'create') {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Palette className="w-6 h-6 text-rose-500"/> Create Brand Kit</h2>
            <button onClick={() => setView('list')} className="text-gray-500 text-sm font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">1. Fetch Core Brand</label>
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                        <Globe className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium" placeholder="stripe.com" value={domain} onChange={e=>setDomain(e.target.value)} />
                     </div>
                     <button onClick={syncBrandFetch} className="bg-gray-900 text-white px-6 rounded-xl text-sm font-bold shadow-sm hover:bg-black transition flex items-center gap-2">
                        {domainStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : <SearchIcon />} Fetch from URL
                     </button>
                   </div>
                   {domainStatus === 'success' && <p className="text-emerald-600 text-xs mt-2 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Success! Fetched colors, typography & logo.</p>}
                   {domainStatus === 'error' && <p className="text-amber-600 text-xs mt-2 font-bold flex items-center gap-1"><InfoIcon/> Limited data. Fallback to manual entry.</p>}
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Brand Name</label>
                      <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={brandName} onChange={e=>setBrandName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Logo URL</label>
                      <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={logo} onChange={e=>setLogo(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Brand Story / Mission</label>
                    <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24 resize-none" value={brandStory} onChange={e=>setBrandStory(e.target.value)} />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><PaintBucket className="w-4 h-4"/> Color Palette</label>
                   <div className="grid grid-cols-3 gap-4">
                     <div><span className="text-[10px] text-gray-400 uppercase font-black">Primary</span><div className="flex items-center gap-2 mt-1"><input type="color" value={colors.primary} onChange={e=>setColors({...colors, primary: e.target.value})} className="w-8 h-8 rounded shrink-0"/><input className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded" value={colors.primary} onChange={e=>setColors({...colors, primary: e.target.value})}/></div></div>
                     <div><span className="text-[10px] text-gray-400 uppercase font-black">Secondary</span><div className="flex items-center gap-2 mt-1"><input type="color" value={colors.secondary} onChange={e=>setColors({...colors, secondary: e.target.value})} className="w-8 h-8 rounded shrink-0"/><input className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded" value={colors.secondary} onChange={e=>setColors({...colors, secondary: e.target.value})}/></div></div>
                     <div><span className="text-[10px] text-gray-400 uppercase font-black">Accent</span><div className="flex items-center gap-2 mt-1"><input type="color" value={colors.accent} onChange={e=>setColors({...colors, accent: e.target.value})} className="w-8 h-8 rounded shrink-0"/><input className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded" value={colors.accent} onChange={e=>setColors({...colors, accent: e.target.value})}/></div></div>
                   </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">2. Tone & Voice Protocol</label>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">Primary Tone</label>
                       <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={tone} onChange={e=>setTone(e.target.value)}>
                          {['Professional', 'Witty', 'Aggressive', 'Empathetic', 'Minimalist', 'Expert/Deep'].map(t=><option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">Primary Audience</label>
                       <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={audience} onChange={e=>setAudience(e.target.value)} />
                     </div>
                   </div>
                   <div className="mt-4">
                     <label className="text-xs font-bold text-gray-500 mb-1 block">Content Pillars (comma separated)</label>
                     <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={contentPillars.join(', ')} onChange={e=>setContentPillars(e.target.value.split(',').map(s=>s.trim()))} />
                   </div>
                   <div className="mt-4">
                     <label className="text-xs font-bold text-gray-500 mb-1 block">CTA Style</label>
                     <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={ctaStyle} onChange={e=>setCtaStyle(e.target.value)} />
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">AI Personality Sliders</label>
                   <div className="space-y-4">
                      <div>
                         <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>Corporate</span><span>Creativity: {aiControls.creativity}%</span><span>Avant Garde</span></div>
                         <input type="range" className="w-full" min="0" max="100" value={aiControls.creativity} onChange={e=>setAiControls({...aiControls, creativity: Number(e.target.value)})} />
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>Conservative</span><span>Contrarian: {aiControls.contrarian}%</span><span>Polemic</span></div>
                         <input type="range" className="w-full" min="0" max="100" value={aiControls.contrarian} onChange={e=>setAiControls({...aiControls, contrarian: Number(e.target.value)})} />
                      </div>
                   </div>
                </div>
                
                <button onClick={handleSave} disabled={loading || !brandName} className="w-full py-4 mt-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle2 className="w-5 h-5"/>} Save Brand Kit
                </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
       <div className="bg-gradient-to-tr from-rose-600 to-pink-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex justify-between items-center">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3"><Palette className="w-10 h-10"/> Brand Kits Hub</h2>
            <p className="text-rose-100 font-medium text-lg leading-relaxed max-w-xl">Centralize your aesthetics, tones, and AI protocols. Auto-inject kits across your campaigns instantly.</p>
          </div>
          <button onClick={() => setView('create')} disabled={kits.length >= 5} className="z-10 bg-white text-rose-800 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-rose-50 transition flex items-center gap-2 disabled:opacity-60">
             <Plus className="w-5 h-5"/> New Kit ({kits.length}/5)
          </button>
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-12 translate-x-12 pointer-events-none"></div>
       </div>

       {kits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 flex flex-col items-center justify-center text-center">
             <Building2 className="w-16 h-16 text-gray-200 mb-4"/>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No brand kits yet</h3>
             <p className="text-gray-500 max-w-md">Fetch typography, colors, and tone-of-voice automatically to speed up your campaign generation process.</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {kits.map(kit => (
               <div key={kit.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col relative group hover:shadow-md transition duration-300">
                  <div className="flex justify-between items-start mb-5 gap-4">
                     {kit.logo ? <img src={kit.logo} referrerPolicy="no-referrer" alt={`${kit.brandName} logo`} className="h-14 w-auto object-contain max-w-[160px] drop-shadow-sm flex-shrink-0" /> : <div className="h-14 w-14 bg-gray-100 rounded-xl flex items-center justify-center font-black text-2xl text-gray-400 shrink-0">{kit.brandName[0]}</div>}
                     <button onClick={() => handleDelete(kit.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1 shrink-0"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{kit.brandName}</h3>
                  <p className="text-xs font-mono text-emerald-600 mb-3 font-semibold">{kit.domain || 'N/A'}</p>
                  
                  {kit.brandStory && (
                     <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{kit.brandStory}</p>
                  )}

                  {Array.isArray(kit.contentPillars) && kit.contentPillars.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-6">
                        {kit.contentPillars.slice(0, 3).map((pillar: string, i: number) => (
                           <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-md">{pillar}</span>
                        ))}
                        {kit.contentPillars.length > 3 && <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 px-2 py-1 rounded-md">+{kit.contentPillars.length - 3}</span>}
                     </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                     <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full shadow-inner border border-gray-200" title="Primary" style={{ backgroundColor: kit.colors?.primary || '#000' }}></div>
                        <div className="w-6 h-6 rounded-full shadow-inner border border-gray-200" title="Secondary" style={{ backgroundColor: kit.colors?.secondary || '#000' }}></div>
                        <div className="w-6 h-6 rounded-full shadow-inner border border-gray-200" title="Accent" style={{ backgroundColor: kit.colors?.accent || '#000' }}></div>
                     </div>
                     <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kit.tone}</span>
                  </div>
               </div>
             ))}
          </div>
       )}
    </div>
  );
}

// Inline missing lucide icons for ease since we didn't import them all above
const SearchIcon = (p:any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const InfoIcon = (p:any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
