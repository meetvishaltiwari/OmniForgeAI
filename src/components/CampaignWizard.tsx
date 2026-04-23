import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, Plus, Target, Layout, PenTool, Image as ImageIcon, Send, ArrowRight, Wand2, CheckCircle2, ChevronRight, Palette, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PublishActions } from './Shared';
import { MetaAdRenderer } from './MetaAdRenderer';

interface CampaignConfig {
  campaign_name: string;
  product_info: {
    name: string;
    value_prop: string;
    ideal_customer: string;
    pain_points: string[];
    main_features: string[];
  };
  targetChannels: string[];
  strategy: string;
}

export function CampaignWizard({ prefillData, onNavigate }: { prefillData?: any, onNavigate?: (tab: string, data?: any) => void }) {
  const { showQuotaError, showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<CampaignConfig>({
    campaign_name: '',
    product_info: { name: '', value_prop: '', ideal_customer: '', pain_points: [], main_features: [] },
    targetChannels: ['linkedin'],
    strategy: 'Growth'
  });

  const [ideas, setIdeas] = useState<any[]>([]);
  const [finalAssets, setFinalAssets] = useState<Record<string, any>>({});
  const [brandKits, setBrandKits] = useState<any[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:3001/api/brand_kits').then(r => r.json()).then(data => {
      if(Array.isArray(data)) setBrandKits(data);
    });
  }, []);

  useEffect(() => {
     if(prefillData) {
        if(prefillData.campaign_name) setConfig(prev => ({...prev, campaign_name: prefillData.campaign_name}));
        if(prefillData.product_info) setConfig(prev => ({...prev, product_info: prefillData.product_info}));
        if(prefillData.targetChannels) setConfig(prev => ({...prev, targetChannels: prefillData.targetChannels}));
        if(prefillData.output_payload?.ideas) setIdeas(prefillData.output_payload.ideas);
     }
  }, [prefillData]);

  const generateIdeas = async () => {
    if(!config.campaign_name || !config.product_info.name) return;
    setIsLoading(true); setIdeas([]);
    try {
      const res = await fetch('http://localhost:3001/api/campaign/ideas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, brandKitId: selectedKitId })
      });
      const data = await res.json();
      if(data.quotaExceeded) { showQuotaError(data.error); return; }
      if(data.error) { showToast(data.error, 'error'); return; }
      setIdeas(data.ideas);
      setStep(2);
    } catch(e) { showToast('Server unreachable.', 'error'); } finally { setIsLoading(false); }
  };

  const generateAssetAndImage = async (idea: any, channel: string, ideaKey: string) => {
    setIsLoading(true);
    try {
      // 1. Generate Copy
      const assetRes = await fetch('http://localhost:3001/api/campaign/assets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, idea, channel, brandKitId: selectedKitId })
      });
      const assetData = await assetRes.json();
      if(assetData.quotaExceeded) { showQuotaError(assetData.error); return; }
      if(assetData.error) { showToast(assetData.error, 'error'); return; }

      setFinalAssets(prev => ({
        ...prev,
        [ideaKey]: { copy: assetData.copy, channel, rawData: assetData.rawData, image: null }
      }));

      // 2. Generate Image
      const imgRes = await fetch('http://localhost:3001/api/campaign/image_generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, idea, channel, copy: assetData.copy, brandKitId: selectedKitId })
      });
      const imgData = await imgRes.json();
      
      setFinalAssets(prev => ({
        ...prev,
        [ideaKey]: { ...prev[ideaKey], image: imgData.imageUrl }
      }));
    } catch(e) { showToast('Failed to build full asset.', 'error'); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
               <Target className="w-8 h-8" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-gray-900">Campaign Architect</h2>
               <p className="text-sm text-gray-500 font-medium">Multi-channel asset engine for high-growth brands.</p>
            </div>
         </div>
         
         <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${step === s ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-gray-400 font-semibold'}`}>
                 <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</span>
                 <span className="text-xs uppercase tracking-widest">{s===1?'Config':s===2?'Ideation':'Build'}</span>
              </div>
            ))}
         </div>
      </div>

      {isLoading && step < 3 && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
           <div className="bg-indigo-600 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-white">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="font-black text-lg animate-pulse uppercase tracking-[0.2em]">Architecting Strategy...</p>
           </div>
        </div>
      )}

      {/* STEP 1: CONFIG */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
           <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <Layout className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-black text-gray-800">1. Core Context</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Internal Campaign ID</label>
                     <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold" placeholder="e.g. Q4 SaaS Growth" value={config.campaign_name} onChange={e=>setConfig({...config, campaign_name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Brand Kit Protocol</label>
                     <select className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold bg-gray-50" value={selectedKitId} onChange={e=>setSelectedKitId(e.target.value)}>
                        <option value="">Default (General Pro)</option>
                        {brandKits.map(k=><option key={k.id} value={k.id}>{k.brandName}</option>)}
                     </select>
                   </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <ImageIcon className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-black text-gray-800">2. Product Payload</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Product Name</label>
                     <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold" placeholder="What are we selling?" value={config.product_info.name} onChange={e=>setConfig({...config, product_info: {...config.product_info, name: e.target.value}})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Value Prop Headline</label>
                     <input className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold" placeholder="e.g. 10x faster deployments" value={config.product_info.value_prop} onChange={e=>setConfig({...config, product_info: {...config.product_info, value_prop: e.target.value}})} />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ideal Customer Profile (ICP)</label>
                     <textarea className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium h-24 resize-none" placeholder="Describe the segment..." value={config.product_info.ideal_customer} onChange={e=>setConfig({...config, product_info: {...config.product_info, ideal_customer: e.target.value}})} />
                   </div>
                </div>
              </section>
              
              <div className="flex justify-end pt-6">
                 <button onClick={generateIdeas} disabled={isLoading || !config.campaign_name || !config.product_info.name} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-10 rounded-2xl flex items-center gap-3 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50">
                    Ideate Strategy <ArrowRight className="w-6 h-6"/>
                 </button>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                 <h4 className="text-xl font-black mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-indigo-400"/> Channels</h4>
                 <div className="space-y-3">
                   {['linkedin', 'meta_ads', 'twitter', 'email'].map(ch => (
                     <label key={ch} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${config.targetChannels.includes(ch) ? 'bg-indigo-600/20 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                        <div className="flex items-center gap-3">
                           <input type="checkbox" className="hidden" checked={config.targetChannels.includes(ch)} onChange={() => {
                             const next = config.targetChannels.includes(ch) ? config.targetChannels.filter(c=>c!==ch) : [...config.targetChannels, ch];
                             setConfig({...config, targetChannels: next});
                           }} />
                           <span className="font-bold capitalize text-sm">{ch.replace('_', ' ')}</span>
                        </div>
                        {config.targetChannels.includes(ch) && <CheckCircle2 className="w-4 h-4 text-indigo-400"/>}
                     </label>
                   ))}
                 </div>
              </div>
              
              <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
                 <h4 className="font-black text-indigo-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest"><Palette className="w-4 h-4"/> Strategy</h4>
                 <div className="grid grid-cols-2 gap-2">
                   {['Growth', 'Authority', 'Direct Response', 'Brand Awareness'].map(s => (
                      <button key={s} onClick={()=>setConfig({...config, strategy: s})} className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${config.strategy === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-indigo-900 border-indigo-100 hover:bg-indigo-100'}`}>{s}</button>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* STEP 2: IDEATION */}
      {step >= 2 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((topic, tIdx) => {
              const platformIdeas = topic.platform_ideas || [];
              return (
                <div key={tIdx} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Concept</span>
                     <h4 className="font-bold text-gray-900 text-lg truncate">{topic.campaign_angle}</h4>
                  </div>
                  
                  {platformIdeas.length > 0 && (
                    <div className="space-y-6">
                      {platformIdeas.map((pIdea: any, pIdx: number) => (
                        <div key={pIdx} className="space-y-4">
                           <div className="text-[11px] font-black uppercase text-gray-400 border-b pb-2 flex items-center gap-2"><Wand2 className="w-3.5 h-3.5"/> {pIdea.platform} Variants</div>
                           <div className="grid grid-cols-1 gap-3">
                             {(pIdea.ideas || []).map((idea: any, iIdx: number) => {
                               const ideaKey = `idea-${tIdx}-${pIdx}-${iIdx}`;
                               const asset = finalAssets[ideaKey];
                               return (
                                 <div key={ideaKey} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition shadow-sm flex flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between items-start mb-3">
                                         <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-1 rounded tracking-wide">IDEA {iIdx + 1}</span>
                                         <div className="flex gap-1">
                                           {(idea.recommended_channels || ['linkedin']).map((ch: string) => <span key={ch} className="text-[10px] border border-gray-200 bg-gray-50 text-gray-600 px-2 py-0.5 rounded capitalize font-bold">{ch}</span>)}
                                         </div>
                                      </div>
                                      <p className="text-sm text-gray-800 font-semibold leading-snug mb-4">{idea.idea_summary}</p>
                                    </div>
                                    
                                    {!asset ? (
                                      <button onClick={() => { generateAssetAndImage(idea, idea.recommended_channels[0] || config.targetChannels[0] || 'linkedin', ideaKey); setStep(3); }} className="w-full bg-white border-2 border-gray-900 text-gray-900 font-bold py-2.5 rounded-lg text-sm hover:bg-gray-900 hover:text-white transition flex justify-center items-center gap-2 mt-auto">
                                        <Sparkles className="w-4 h-4"/> Build Asset & Image
                                      </button>
                                    ) : (
                                      <div className="w-full bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm flex items-center justify-center gap-2 font-bold text-emerald-800 mt-auto">
                                        <CheckCircle2 className="w-4 h-4" /> Asset Constructed
                                      </div>
                                    )}
                                 </div>
                               );
                             })}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(finalAssets).length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-10 text-white mt-12 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-black mb-8 flex items-center gap-3"><Palette className="w-8 h-8 text-fuchsia-400"/> Generated Assets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(finalAssets).map(([key, asset]) => (
                  asset.channel === 'meta_ads' ? (
                    <div key={key} className="md:col-span-2 border border-gray-200 overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                      <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr]">
                        <div className="relative min-h-[320px] xl:min-h-full bg-slate-950 border-b xl:border-b-0 xl:border-r border-slate-800 overflow-hidden">
                          {asset.image ? (
                            <img src={asset.image} alt="Generated Asset" className="absolute inset-0 w-full h-full object-cover opacity-95" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.35),transparent_42%),linear-gradient(180deg,#0f172a,#111827)]">
                              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300 mb-3" />
                              <span className="text-xs tracking-[0.2em] font-bold uppercase text-fuchsia-100">Rendering Scene</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                          <div className="absolute top-4 left-4 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] bg-white/90 text-slate-700 border border-white/80">
                            Meta Ads
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold uppercase tracking-[0.18em] text-white border border-white/10">
                              Saved creative preview
                            </div>
                            <p className="mt-3 text-sm text-slate-200 leading-6 max-w-sm">
                              Visual preview and structured launch brief for this generated Meta Ads concept.
                            </p>
                          </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-slate-50 flex flex-col">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Generated Asset</div>
                              <h3 className="mt-2 text-2xl font-black text-slate-900">Meta Ads creative brief</h3>
                            </div>
                            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">
                              Reusable in restored sessions
                            </span>
                          </div>

                          <div className="flex-1">
                            <MetaAdRenderer data={asset.rawData} />
                          </div>

                          <div className="mt-6">
                            <PublishActions content={asset.copy || ''} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={key} className="bg-gray-800 border border-gray-700 overflow-hidden rounded-2xl flex flex-col">
                      <div className="h-48 bg-gray-900 border-b border-gray-700 flex items-center justify-center relative">
                         {asset.image ? (
                           <img src={asset.image} alt="Generated Asset" className="w-full h-full object-cover" />
                         ) : (
                            <div className="flex flex-col items-center opacity-50">
                             <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500 mb-2" />
                             <span className="text-xs tracking-widest font-bold uppercase text-fuchsia-300">Rendering Scene</span>
                           </div>
                         )}
                         <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md text-white">{asset.channel}</div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-emerald-300 flex-1 overflow-y-auto pr-2 custom-scrollbar">{asset.copy}</div>
                        <PublishActions content={asset.copy || ''} />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
