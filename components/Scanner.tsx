import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Lead, LeadStatus } from '../types';

interface ScannerProps {
  onSaveLead: (lead: Lead) => void;
  isLeadSaved: (nome: string) => boolean;
  onOpenAnalysis: (lead: any) => void;
  onOpenPitch: (lead: any) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onSaveLead, isLeadSaved, onOpenAnalysis, onOpenPitch }) => {
  const [nicho, setNicho] = useState('Pizzaria Gourmet');
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const handleScan = async () => {
    if (!local) return alert('Informe a Cidade e UF para começar.');
    
    setErrorLog(null);
    setLoading(true);
    setResults([]);

    try {
      const data = await geminiService.scanLeads(nicho, local);
      setResults(data);
    } catch (error: any) {
      setErrorLog(error.friendlyMessage || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 scanning-effect relative">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <div className="glass-panel p-6 rounded-3xl border-zinc-800 shadow-2xl neon-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1 tracking-tighter">Nicho de Mercado</label>
              <div className="relative">
                <i className="fas fa-tag absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
                <input 
                  type="text" 
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl pl-10 pr-4 py-3.5 text-sm focus:border-[#66CC00] outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1 tracking-tighter">Local de Operação</label>
              <div className="relative">
                <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
                <input 
                  type="text" 
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl pl-10 pr-4 py-3.5 text-sm focus:border-[#66CC00] outline-none transition-all"
                  placeholder="Ex: São Paulo, SP"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-[#66CC00] hover:bg-[#77ee00] text-black font-extrabold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_4px_20px_rgba(102,204,0,0.3)] group"
          >
            {loading ? <i className="fas fa-satellite fa-spin text-lg"></i> : <i className="fas fa-bolt group-hover:scale-125 transition-transform"></i>}
            <span className="uppercase tracking-widest text-xs">Iniciar Varredura Profunda</span>
          </button>

          {errorLog && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-fadeIn">
              <div className="flex gap-3">
                <i className="fas fa-circle-exclamation text-red-500 mt-1"></i>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Protocolo de Segurança Ativado</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                    {errorLog}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {loading && (
            <div className="py-24 text-center space-y-6 animate-pulse">
              <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 border-4 border-[#66CC00]/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-[#66CC00] border-t-transparent rounded-full animate-spin"></div>
                 <i className="fas fa-radar text-2xl text-[#66CC00] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
              </div>
              <p className="text-[#66CC00] text-xs font-mono uppercase tracking-[0.3em] font-bold">Rastreando Leads em Tempo Real...</p>
            </div>
          )}

          {!loading && results.map((result, idx) => {
            const saved = isLeadSaved(result.nome);
            return (
              <div key={idx} className="glass-panel p-6 rounded-3xl border-zinc-800 hover:border-[#66CC00]/50 transition-all duration-500 animate-fadeIn group">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-white tracking-tight group-hover:text-[#66CC00] transition-colors">{result.nome}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                      <i className="fas fa-map-marker-alt text-red-500/60"></i>
                      <span>{result.endereco}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSaveLead({
                      ...result,
                      id: Math.random().toString(36).substr(2, 9),
                      status: LeadStatus.NEW,
                      dateAdded: new Date().toLocaleDateString()
                    })}
                    disabled={saved}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all ${saved ? 'bg-[#66CC00]/20 text-[#66CC00] cursor-default' : 'bg-white text-black hover:bg-[#66CC00] hover:scale-105 shadow-xl'}`}
                  >
                    {saved ? 'SALVO NO CRM' : 'CAPTURAR'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Nota</span>
                    <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                      <i className="fas fa-star text-[10px]"></i>
                      <span className="text-sm">{result.nota || '---'}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Avaliações</span>
                    <div className="flex items-center gap-1.5 text-blue-400 font-black">
                      <i className="fas fa-users text-[10px]"></i>
                      <span className="text-sm">{result.reviews || '0'}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">WhatsApp</span>
                    <div className="flex items-center gap-1.5 text-green-500 font-black">
                      <i className="fab fa-whatsapp text-sm"></i>
                      <span className="text-[9px] truncate w-20 text-center">{result.whatsapp ? 'DISPONÍVEL' : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Website</span>
                    <div className="flex items-center gap-1.5 text-purple-400 font-black">
                      <i className="fas fa-globe text-sm"></i>
                      <span className="text-[9px] truncate w-20 text-center">{result.website ? 'ATIVO' : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl mb-6">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-brain text-[#66CC00]"></i> Insight de Abordagem
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{result.insight}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => onOpenAnalysis(result)} className="bg-[#18181b] hover:bg-[#27272a] text-zinc-300 py-3 rounded-xl text-[11px] font-bold border border-zinc-800 flex items-center justify-center gap-2 transition-all hover:border-blue-500/50">
                    <i className="fas fa-microscope text-blue-400"></i> ANÁLISE SWOT
                  </button>
                  <button onClick={() => onOpenPitch(result)} className="bg-[#18181b] hover:bg-[#27272a] text-zinc-300 py-3 rounded-xl text-[11px] font-bold border border-zinc-800 flex items-center justify-center gap-2 transition-all hover:border-[#66CC00]/50">
                    <i className="fas fa-comment-dollar text-[#66CC00]"></i> GERAR PITCH
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Scanner;