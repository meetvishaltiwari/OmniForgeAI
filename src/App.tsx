import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Megaphone, 
  PenTool, 
  ImagePlus, 
  MessageCircle, 
  Palette, 
  Database,
  Recycle,
  LogOut,
  Compass,
  TrendingUp,
  ArrowLeft,
  Calendar as CalIcon
} from 'lucide-react';
import { ActivityDashboard } from './components/ActivityDashboard';
import { BrandKitManager } from './components/BrandKitManager';
import { CampaignWizard } from './components/CampaignWizard';
import { CommandCenter } from './components/CommandCenter';
import { DiscoveryHub } from './components/DiscoveryHub';
import { EngagementAssistant } from './components/EngagementAssistant';
import { FeedViewer } from './components/FeedViewer';
import { HookGenerator } from './components/HookGenerator';
import { LoginScreen } from './components/LoginScreen';
import { PostBuilder } from './components/PostBuilder';
import { RepurposingEngine } from './components/RepurposingEngine';
import { RewriterEngine } from './components/RewriterEngine';
import { VisualStudio } from './components/VisualStudio';
import { TrendAnalyser } from './components/TrendAnalyser';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [activeTab, setActiveTab] = useState<any>('discover');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('omni_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: any) => {
    setUser(u);
    localStorage.setItem('omni_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('omni_user');
  };

  const handleNavigate = (id: any, data?: any) => {
    setNavHistory(prev => [...prev, activeTab]);
    setActiveTab(id);
    if(data) setPrefillData(data);
  };

  const handleBack = () => {
    if (navHistory.length === 0) return;
    const prev = navHistory[navHistory.length - 1];
    setNavHistory(prevHistory => prevHistory.slice(0, -1));
    setActiveTab(prev);
    setPrefillData(null);
  };

  const setTabAndHistory = (id: any) => {
    if(activeTab !== id) {
       setNavHistory([]);
    }
    setActiveTab(id);
    setPrefillData(null);
  };

  const toggleGroup = (group: string) => {
    setClosedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const TAB_GROUPS = [
    {
      group: 'Discover',
      items: [
        { id: 'feed', label: 'Radar', icon: Layers, color: 'text-sky-600', bg: 'bg-sky-50' },
        { id: 'discover', label: 'Ideas', icon: Compass, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'trend', label: 'Trends', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
      ]
    },
    {
      group: 'Create',
      items: [
        { id: 'campaign', label: 'Campaigns', icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'generator', label: 'Post Builder', icon: PenTool, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'rewriter', label: 'Refine', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'repurpose', label: 'Repurpose', icon: Recycle, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
      ]
    },
    {
      group: 'Studio',
      items: [
        { id: 'visuals', label: 'Visuals', icon: ImagePlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ]
    },
    {
      group: 'Execute',
      items: [
        { id: 'command', label: 'Calendar', icon: CalIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'engagement', label: 'Inbox', icon: MessageCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
      ]
    },
    {
      group: 'Workspace',
      items: [
        { id: 'brand_kit', label: 'Brand Kits', icon: Palette, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'library', label: 'History', icon: Database, color: 'text-gray-600', bg: 'bg-gray-100' },
      ]
    }
  ];

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ToastProvider>
    <div className="h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-50 shadow-sm relative">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">OmniForge AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
               <img src={user.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="Profile" className="w-9 h-9 rounded-full border border-gray-200 shadow-sm cursor-pointer bg-white" />
               <div className="absolute right-0 top-10 bg-white border border-gray-200 shadow-xl rounded-xl p-2 hidden group-hover:block transition z-50 min-w-[200px]">
                  <div className="p-2 border-b border-gray-100 mb-2">
                     <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                     <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-2 py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded flex items-center gap-2"><LogOut className="w-4 h-4"/> Sign Out</button>
               </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-900 focus:outline-none"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT PANEL (EXPAND/SHRINK) */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out border-r border-gray-200 bg-white overflow-hidden flex flex-col shadow-inner z-40 flex-shrink-0`}>
          <div className="p-4 border-b bg-gray-50 whitespace-nowrap">
             <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">Feature Menu</span>
          </div>
          <div className="p-2 flex flex-col gap-4 overflow-y-auto flex-1 h-full min-w-[16rem]">
            {TAB_GROUPS.map(group => {
              const isClosed = closedGroups[group.group];
              return (
              <div key={group.group}>
                <div onClick={() => toggleGroup(group.group)} className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded-md transition group">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition">{group.group}</span>
                   {isClosed ? <ChevronRight className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                </div>
                {!isClosed && (
                  <div className="flex flex-col gap-1 mt-1">
                    {group.items.map(tab => (
                       <button 
                         key={tab.id} 
                         onClick={() => setTabAndHistory(tab.id as any)} 
                         className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all w-full text-left whitespace-nowrap ${activeTab === tab.id ? `${tab.bg} ${tab.color} shadow-sm border border-[currentColor]/10` : `text-gray-600 hover:bg-gray-50 border border-transparent`}`}
                       >
                         <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} /> {tab.label}
                       </button>
                    ))}
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-[1600px] w-full mx-auto">
            {navHistory.length > 0 && (
               <button onClick={handleBack} className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm transition">
                  <ArrowLeft className="w-3 h-3" /> Back
               </button>
            )}
            
            {activeTab === 'library' && <ActivityDashboard onNavigate={handleNavigate} />}
            {activeTab === 'brand_kit' && <BrandKitManager />}
            {activeTab === 'trend' && <TrendAnalyser prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'campaign' && <CampaignWizard prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'discover' && <DiscoveryHub prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'repurpose' && <RepurposingEngine prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'generator' && <PostBuilder prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'rewriter' && <RewriterEngine prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'visuals' && <VisualStudio prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'engagement' && <EngagementAssistant prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'command' && <CommandCenter prefillData={prefillData} onNavigate={handleNavigate} />}
            {activeTab === 'feed' && <FeedViewer />}
          </div>
        </main>
        
      </div>
    </div>
    </ToastProvider>
  );
}

export default App;
