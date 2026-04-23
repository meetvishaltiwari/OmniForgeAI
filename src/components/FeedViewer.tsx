import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Link as LinkIcon, Camera, Loader2 } from 'lucide-react';

export function FeedViewer() {
  const [sources, setSources] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState('');

  useEffect(() => {
    fetchSources();
    fetchFeed();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sources');
      const data = await res.json();
      setSources(data);
    } catch(e) {}
  };

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/feed');
      const data = await res.json();
      setPosts(data);
    } catch(e) {} finally { setIsLoading(false); }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/sources', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: newSourceUrl })
      });
      if(res.ok) {
        setNewSourceUrl('');
        fetchSources();
        fetchFeed();
      }
    } catch(e) {}
  };

  const handleDeleteSource = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/api/sources/${id}`, { method: 'DELETE' });
      fetchSources();
      fetchFeed();
    } catch(e) {}
  };

  if(sources.length === 0 && !isLoading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
         <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Camera className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-3">Your feed is empty</h2>
           <p className="text-gray-500 mb-8 font-medium">Add some Instagram or LinkedIn profiles to track and we'll generate an AI-simulated feed for you to analyze.</p>
           
           <form onSubmit={handleAddSource} className="space-y-4">
             <div className="relative">
               <LinkIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
               <input 
                 type="url" 
                 required 
                 value={newSourceUrl} 
                 onChange={e => setNewSourceUrl(e.target.value)} 
                 placeholder="https://instagram.com/nike" 
                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition text-sm font-medium"
               />
             </div>
             <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
               <Plus className="w-5 h-5" /> Start Tracking
             </button>
           </form>
         </div>
       </div>
    );
  }

  return (
    <div className="max-w-[470px] mx-auto pb-20 pt-4 relative min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50/90 backdrop-blur-md z-10 py-4 px-2">
         <h1 className="text-xl font-bold font-serif tracking-tight">Timeline</h1>
         <button onClick={() => setIsManageModalOpen(true)} className="flex items-center gap-2 bg-gray-200/50 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold transition">
            <Settings className="w-4 h-4" /> Manage
         </button>
      </div>

      {/* FEED LIST */}
      <div className="flex flex-col gap-8">
        {posts.length === 0 ? (
           <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
             <p className="text-gray-500">We're generating the latest mock content from your sources...</p>
             <p className="text-sm text-gray-400 mt-2">Refresh the page in a few moments.</p>
           </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 p-[2px]">
                     <img src={post.avatar} alt="avatar" className="w-full h-full rounded-full border-2 border-white object-cover" />
                  </div>
                  <div>
                     <p className="text-sm font-semibold text-gray-900 leading-none">{post.handle} <span className="text-gray-400 font-normal ml-1 text-xs">• {post.timestamp}</span></p>
                  </div>
                </div>
                <button className="text-gray-900 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post Image: Assuming 4:5 aspect ratio mock */}
              <div className="bg-gray-100 relative w-full aspect-[4/5] sm:aspect-square flex items-center justify-center overflow-hidden">
                <img src={post.image} alt="post" className="w-full h-full object-cover" />
              </div>

              {/* Action Bar */}
              <div className="p-3">
                 <div className="flex justify-between items-center mb-3">
                   <div className="flex gap-4 items-center">
                     <Heart className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-600 transition" />
                     <MessageCircle className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-600 transition -scale-x-100" />
                     <Send className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-600 transition" />
                   </div>
                   <Bookmark className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-600 transition" />
                 </div>
                 
                 {/* Likes */}
                 <p className="font-semibold text-sm text-gray-900 mb-1">{post.likes} likes</p>
                 
                 {/* Caption */}
                 <p className="text-sm text-gray-900 leading-relaxed max-w-full">
                   <span className="font-semibold mr-2 cursor-pointer">{post.handle}</span>
                   {post.caption}
                 </p>
                 
                 {/* Comments count */}
                 <p className="text-sm text-gray-500 mt-2 cursor-pointer font-medium">View all {post.comments} comments</p>
                 
                 {/* Impressions marker (Not authentic Meta, but required) */}
                 <div className="text-[10px] uppercase font-bold text-gray-400 mt-3 pt-3 border-t border-gray-100 tracking-wider">
                   Total Impressions: {post.impressions}
                 </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* MANAGE SOURCES MODAL */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center text-center relative">
                 <button onClick={() => setIsManageModalOpen(false)} className="text-sm font-semibold text-gray-500 absolute left-4">Cancel</button>
                 <h3 className="font-semibold text-gray-900 flex-1">Manage Sources</h3>
              </div>
              <div className="p-6 h-[400px] overflow-y-auto bg-gray-50 flex flex-col gap-4">
                 <form onSubmit={handleAddSource} className="flex gap-2">
                   <input 
                     type="url" 
                     required 
                     value={newSourceUrl} 
                     onChange={e => setNewSourceUrl(e.target.value)} 
                     placeholder="https://instagram.com/..." 
                     className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                   />
                   <button type="submit" disabled={sources.length >= 10} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Add</button>
                 </form>
                 <div className="text-xs text-gray-500 mb-2">Tracking {sources.length}/10 available slots.</div>
                 
                 <div className="space-y-3">
                   {sources.map(s => (
                     <div key={s.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                       <div className="flex items-center gap-3 overflow-hidden">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                           {s.source_type === 'instagram' ? <Camera className="w-5 h-5 text-rose-500" /> : <LinkIcon className="w-5 h-5 text-gray-500" />}
                         </div>
                         <div className="truncate">
                           <p className="text-sm font-semibold text-gray-900 truncate">{s.source_url.replace('https://www.instagram.com/', '')}</p>
                           <p className="text-xs text-gray-500 capitalize">{s.source_type}</p>
                         </div>
                       </div>
                       <button onClick={() => handleDeleteSource(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-5 h-5" />
                       </button>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
