
import React, { useState, useMemo, useEffect } from 'react';
import { PRAYERS } from './constants';
import { Prayer, AppView, ChatMessage } from './types';
import AudioPlayer from './components/AudioPlayer';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LIST);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Assalamualaikum. Saya asisten spiritual Anda. Ada yang ingin Anda tanyakan mengenai doa atau adab harian?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const categories = ['Semua', ...new Set(PRAYERS.map(p => p.category))];

  const filteredPrayers = useMemo(() => {
    return PRAYERS.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'Semua' || p.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  }, []);

  const handlePrayerClick = (prayer: Prayer) => {
    setSelectedPrayer(prayer);
    setView(AppView.DETAIL);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await geminiService.askAboutDoa(userMsg);
    setChatMessages(prev => [...prev, { role: 'model', text: response || 'Mohon maaf, terjadi gangguan koneksi.' }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Header */}
      <header className={`glass-header sticky top-0 z-40 border-b border-emerald-100/50 transition-all duration-300`}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => setView(AppView.LIST)}
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-50 shadow-lg shadow-emerald-900/10">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <span className="serif-text font-bold text-lg tracking-tight text-emerald-950">Al-Ma'tsurat</span>
          </button>

          <button 
            onClick={() => setView(AppView.AI_CHAT)}
            className={`p-2.5 rounded-full transition-all duration-300 ${view === AppView.AI_CHAT ? 'bg-emerald-900 text-white rotate-12' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {view === AppView.LIST && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
            {/* Hero Section */}
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-emerald-700/60 uppercase tracking-[0.2em]">{greeting}</h2>
              <h3 className="serif-text text-4xl font-bold text-emerald-950">Kedamaian dalam <br/>setiap doa.</h3>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Cari makna atau judul doa..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-emerald-900/5 focus:border-emerald-200 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-900/20 group-focus-within:text-emerald-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTab === cat ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' : 'bg-white text-emerald-900/60 border border-emerald-50 hover:border-emerald-100 hover:text-emerald-900'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Prayer Cards */}
            <div className="grid gap-5">
              {filteredPrayers.map((prayer, idx) => (
                <div 
                  key={prayer.id}
                  onClick={() => handlePrayerClick(prayer)}
                  className="group card-gradient p-6 rounded-[2rem] border border-emerald-50/50 elegant-shadow hover:scale-[1.02] active:scale-95 transition-all duration-500 cursor-pointer flex justify-between items-start"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">
                        {prayer.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="serif-text text-xl font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">{prayer.title}</h4>
                      <p className="text-slate-400 text-sm italic mt-1 font-light line-clamp-1">"{prayer.meaning}"</p>
                    </div>
                  </div>
                  <div className="mt-1 p-2 rounded-full bg-emerald-50/50 text-emerald-900/20 group-hover:text-emerald-900 group-hover:bg-emerald-100 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === AppView.DETAIL && selectedPrayer && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-xl mx-auto">
            <button 
              onClick={() => setView(AppView.LIST)}
              className="mb-8 flex items-center gap-2 text-emerald-900/40 hover:text-emerald-900 font-bold text-xs uppercase tracking-widest transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              Kembali Ke Daftar
            </button>

            <div className="space-y-12">
              <header className="text-center space-y-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.3em] bg-amber-50 px-4 py-1.5 rounded-full inline-block">
                  {selectedPrayer.category}
                </span>
                <h2 className="serif-text text-4xl font-bold text-emerald-950 leading-tight">{selectedPrayer.title}</h2>
              </header>

              <div className="bg-white p-10 rounded-[3rem] elegant-shadow border border-emerald-50/30 relative">
                 <div className="absolute top-0 right-10 -translate-y-1/2">
                   <AudioPlayer text={selectedPrayer.arabic} />
                 </div>

                 <div className="space-y-12">
                   <div className="text-center pt-4">
                     <p className="arabic-text text-5xl leading-[1.8] text-emerald-950 font-medium">
                       {selectedPrayer.arabic}
                     </p>
                   </div>

                   <div className="space-y-8 pt-8 border-t border-emerald-50">
                     <div className="space-y-2">
                       <h5 className="text-[10px] font-bold text-emerald-900/20 uppercase tracking-widest">Transliterasi</h5>
                       <p className="serif-text text-xl italic text-emerald-900 font-medium leading-relaxed">
                         {selectedPrayer.latin}
                       </p>
                     </div>

                     <div className="space-y-3">
                       <h5 className="text-[10px] font-bold text-emerald-900/20 uppercase tracking-widest">Terjemahan</h5>
                       <p className="text-lg text-slate-600 leading-relaxed font-light">
                         {selectedPrayer.meaning}
                       </p>
                     </div>
                   </div>
                 </div>
              </div>

              <footer className="text-center text-slate-300 text-[10px] uppercase tracking-widest pt-4">
                Akhir Dari Doa
              </footer>
            </div>
          </div>
        )}

        {view === AppView.AI_CHAT && (
          <div className="animate-in fade-in zoom-in-95 duration-500 h-[calc(100vh-14rem)] flex flex-col bg-white rounded-[2.5rem] elegant-shadow border border-emerald-50 overflow-hidden">
             <div className="p-6 bg-emerald-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-800 rounded-2xl flex items-center justify-center border border-emerald-700">
                    <svg className="w-6 h-6 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div>
                    <h3 className="serif-text font-bold text-lg">Asisten Spiritual</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online • Gemini 3.0</p>
                  </div>
                </div>
                <button onClick={() => setView(AppView.LIST)} className="p-2 hover:bg-emerald-900 rounded-full transition-colors text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-emerald-50/20 no-scrollbar">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-900 text-white rounded-tr-none shadow-lg shadow-emerald-900/10' 
                        : 'bg-white text-emerald-950 rounded-tl-none border border-emerald-100 elegant-shadow'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white px-5 py-4 rounded-3xl rounded-tl-none border border-emerald-100 elegant-shadow">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-900/20 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-900/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-900/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
             </div>

             <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-emerald-50">
                <div className="flex gap-3 bg-emerald-50/50 p-2 rounded-3xl border border-emerald-50">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanyakan sesuatu tentang doa..."
                    className="flex-1 px-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-emerald-950 placeholder:text-emerald-900/30 text-sm font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isTyping}
                    className="w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-800 active:scale-90 transition-all disabled:opacity-30 disabled:grayscale shadow-md shadow-emerald-900/20"
                  >
                    <svg className="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
             </form>
          </div>
        )}
      </main>

      {/* Elegant Bottom Nav for Mobile */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-emerald-950/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-2 flex justify-between items-center shadow-2xl shadow-emerald-950/40 md:hidden z-50">
        <button 
          onClick={() => setView(AppView.LIST)}
          className={`flex-1 flex flex-col items-center py-2 transition-all duration-500 ${view === AppView.LIST || view === AppView.DETAIL ? 'text-white' : 'text-emerald-500/50 hover:text-emerald-200'}`}
        >
          <svg className={`w-5 h-5 transition-transform duration-500 ${view === AppView.LIST ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[8px] mt-1 font-bold uppercase tracking-widest">Halaman</span>
        </button>
        <button 
          onClick={() => setView(AppView.AI_CHAT)}
          className={`flex-1 flex flex-col items-center py-2 transition-all duration-500 ${view === AppView.AI_CHAT ? 'text-white' : 'text-emerald-500/50 hover:text-emerald-200'}`}
        >
          <svg className={`w-5 h-5 transition-transform duration-500 ${view === AppView.AI_CHAT ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-[8px] mt-1 font-bold uppercase tracking-widest">Asisten</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
