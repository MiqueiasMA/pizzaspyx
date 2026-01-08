
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leadsCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, leadsCount }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b] text-zinc-100">
      {/* Header */}
      <header className="h-16 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#66CC00] rounded flex items-center justify-center">
            <i className="fas fa-rocket text-black text-lg"></i>
          </div>
          <h1 className="font-bold text-lg tracking-tight">PizzaSpy<span className="text-[#66CC00]">X</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-zinc-500 bg-[#18181b] px-3 py-1.5 rounded-full border border-[#27272a]">
            <span className="w-2 h-2 rounded-full bg-[#66CC00] animate-pulse"></span>
            PROSPECTING MODE
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-[#27272a] bg-[#09090b] shrink-0">
        <button 
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 py-4 text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab === 'scanner' ? 'text-[#66CC00] border-b-2 border-[#66CC00]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <i className="fas fa-search"></i> <span>VARREDURA</span>
        </button>
        <button 
          onClick={() => setActiveTab('crm')}
          className={`flex-1 py-4 text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab === 'crm' ? 'text-[#66CC00] border-b-2 border-[#66CC00]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <i className="fas fa-users"></i> 
          <span>MEUS LEADS</span>
          <span className="bg-[#27272a] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ml-1">
            {leadsCount}
          </span>
        </button>
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
