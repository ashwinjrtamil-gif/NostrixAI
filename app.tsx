"use client";
import React, { useState, useEffect } from 'react';
import { Globe, Plus, X, Search, Terminal, Zap, Shield, ChevronRight } from 'lucide-react';

export default function NostrixSovereign() {
  const [tabs, setTabs] = useState([
    { id: 1, title: 'Sovereign Hub', url: 'https://www.bing.com', active: true }
  ]);
  const [query, setQuery] = useState('');
  const [isCommandMode, setIsCommandMode] = useState(false);

  // Feature: Intelligent Command Router
  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    let finalUrl = query;
    if (query.startsWith('/')) {
      // Command Logic (e.g., /new, /clear)
      if (query.startsWith('/new ')) {
        const url = query.replace('/new ', '');
        addTab(url);
      }
    } else if (!query.includes('.') || query.includes(' ')) {
      // Engineering Search Bias
      finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(query + " engineering documentation")}`;
      addTab(finalUrl);
    } else {
      // Direct URL
      const url = query.startsWith('http') ? query : `https://${query}`;
      updateActiveTab(url);
    }
    setQuery('');
  };

  const addTab = (url: string) => {
    const id = Date.now();
    const newTabs = tabs.map(t => ({ ...t, active: false }));
    setTabs([...newTabs, { id, title: url.split('/')[2] || 'New Node', url, active: true }]);
  };

  const updateActiveTab = (url: string) => {
    setTabs(tabs.map(t => t.active ? { ...t, url, title: url.split('/')[2] || t.title } : t));
  };

  const closeTab = (id: number) => {
    if (tabs.length === 1) return;
    const filtered = tabs.filter(t => t.id !== id);
    if (!filtered.find(t => t.active)) filtered[0].active = true;
    setTabs(filtered);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#eee] font-mono overflow-hidden">
      
      {/* --- SIDEBAR: Workspace Management --- */}
      <div className="w-72 bg-[#080808] border-r border-[#1a1a1a] flex flex-col p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#00ff41] animate-pulse" />
          <h1 className="text-xl font-black tracking-tighter text-[#00ff41]">NOSTRIX OS</h1>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Active Nodes</p>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <div 
                  key={tab.id}
                  onClick={() => setTabs(tabs.map(t => ({ ...t, active: t.id === tab.id })))}
                  className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all ${
                    tab.active ? 'bg-[#111] border border-[#00ff41]/30 text-[#00ff41]' : 'hover:bg-[#111] text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Globe size={14} className={tab.active ? "text-[#00ff41]" : ""} />
                    <span className="text-xs truncate">{tab.title}</span>
                  </div>
                  <X 
                    size={14} 
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" 
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Sovereign Workspaces</p>
            <div className="space-y-2">
              {['AEROSPACE_ENG', 'QUANT_FINANCE', 'NEURAL_NETS'].map(ws => (
                <div key={ws} className="flex items-center gap-2 text-[11px] text-gray-600 hover:text-[#00ff41] cursor-pointer">
                  <ChevronRight size={12} /> {ws}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- DUAL-MODE COMMAND BAR --- */}
        <form onSubmit={handleAction} className="mt-4 relative">
          <div className="absolute left-3 top-3 text-[#00ff41]">
            {isCommandMode ? <Terminal size={16} /> : <Search size={16} />}
          </div>
          <input 
            type="text"
            placeholder={isCommandMode ? "System command..." : "Search or URL..."}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsCommandMode(e.target.value.startsWith('/'));
            }}
            className="w-full bg-[#000] border border-[#222] rounded-lg py-3 pl-10 pr-4 text-xs focus:border-[#00ff41] focus:ring-1 focus:ring-[#00ff41] outline-none transition-all"
          />
        </form>
      </div>

      {/* --- VIEWPORT: The Content Layer --- */}
      <div className="flex-1 flex flex-col bg-[#000]">
        <div className="h-1 bg-[#111]">
          <div className="h-full bg-[#00ff41] transition-all duration-500" style={{ width: '100%' }} />
        </div>
        
        {tabs.find(t => t.active) ? (
          <iframe 
            src={tabs.find(t => t.active)?.url} 
            className="w-full h-full border-none"
            title="Nostrix Viewport"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Zap size={48} className="text-[#00ff41] animate-pulse" />
            <p className="text-gray-500 text-sm">NO ACTIVE NODE FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
