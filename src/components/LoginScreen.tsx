import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Sparkles, ShieldCheck, Mail, LogIn } from 'lucide-react';

export function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [mockEmail, setMockEmail] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleMockLogin = () => {
    if(!mockEmail.trim()) return;
    const user = {
      email: mockEmail,
      name: mockEmail.split('@')[0],
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockEmail}`
    };
    onLogin(user);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
     if(credentialResponse.credential) {
         try {
             const decoded: any = jwtDecode(credentialResponse.credential);
             onLogin({
                 email: decoded.email,
                 name: decoded.name,
                 picture: decoded.picture
             });
         } catch(e) {
             console.error('Invalid token structure');
         }
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-indigo-100">
       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
           <div className="bg-indigo-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg mb-8">
                   <Sparkles className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h1 className="text-4xl font-black mb-4">OmniForge AI</h1>
                 <p className="text-indigo-100 text-lg leading-relaxed">Forge, Analyze, and Scale Content Across Every Channel. Your AI-powered content & design operating system.</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
           </div>
           
           <div className="p-12 flex flex-col justify-center bg-white">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Secure Access</h2>
              <p className="text-gray-500 font-medium mb-8">Authenticate to access your private dashboard.</p>
              
              {clientId ? (
                  <GoogleOAuthProvider clientId={clientId}>
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col items-center">
                          <GoogleLogin
                             onSuccess={handleGoogleSuccess}
                             onError={() => console.error('Login Failed')}
                             useOneTap
                          />
                      </div>
                      <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                         <ShieldCheck className="w-4 h-4"/> 256-bit Secure TLS Connection
                      </div>
                  </GoogleOAuthProvider>
              ) : (
                  <div className="space-y-4">
                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-4">
                        <strong className="block mb-1">Missing Setup:</strong>
                        VITE_GOOGLE_CLIENT_ID is not set in `.env`. Falling back to simulated login for development mode.
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Simulated Email Identity</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                              type="email" 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                              placeholder="developer@example.com"
                              value={mockEmail}
                              onChange={e=>setMockEmail(e.target.value)}
                              onKeyDown={e=> e.key === 'Enter' && handleMockLogin()}
                          />
                        </div>
                     </div>
                     <button onClick={handleMockLogin} disabled={!mockEmail.trim()} className="w-full bg-gray-900 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-60">
                        <LogIn className="w-5 h-5"/> Launch Workspace
                     </button>
                  </div>
              )}
           </div>
       </div>
    </div>
  );
}
