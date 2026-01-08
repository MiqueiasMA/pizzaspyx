
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
  const [nicho, setNicho] = useState('Pizzaria');
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleScan = async (isLoadMore = false) => {
    if (!local) return alert('Por favor, informe uma cidade/UF');
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setResults([]); // Limpa para nova busca do zero
    }

    try {
      const existingNames = results.map(r => r.nome);
      const data = await geminiService.scanLeads(nicho, local, existingNames);
      
      if (isLoadMore) {
        setResults(prev => [...prev, ...data]);
      } else {
        setResults(data);
      }

      if (data.length === 0) {
        alert('Nenhum novo lead encontrado com os critérios atuais.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao realizar varredura. Tente novamente.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="glass-panel p-6 rounded-2xl border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Nicho de Negócio</label>
              <input 
                type="text" 
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm focus:border-[#66CC00] outline-none transition"
                placeholder="Ex: Pizzaria, Hamburgueria"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Localização (Cidade, UF)</label>
              <input 
                type="text" 
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm focus:border-[#66CC00] outline-none transition"
                placeholder="Ex: Petrolina, PE"
              />
            </div>
          </div>
          <button 
            onClick={() => handleScan(false)}
            disabled={loading || loadingMore}
            className="w-full bg-[#66CC00] hover:bg-[#55aa00] text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(102,204,0,0.15)] disabled:opacity-50"
          >
            {loading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fas fa-crosshairs"></i>
            )}
            <span className="uppercase tracking-wider text-sm">Iniciar Varredura Inteligente</span>
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {loading && (
            <div className="py-20 text-center space-y-4 animate-pulse">
              <i className="fas fa-radar text-4xl text-[#66CC00]"></i>
              <p className="text-zinc-500 text-sm font-mono">RASTREANDO LEADS EM TEMPO REAL...</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-20 text-center opacity-20">
              <i className="fas fa-map-marked-alt text-6xl mb-4"></i>
              <p className="text-lg">Pronto para buscar novas oportunidades.</p>
            </div>
          )}

          {!loading && results.map((result, idx) => {
            const saved = isLeadSaved(result.nome);
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl border-zinc-800 hover:border-[#66CC00]/50 transition-all group animate-fadeIn" style={{animationDelay: `${(idx % 10) * 100}ms`}}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-white leading-tight">{result.nome}</h3>
                    <p className="text-xs text-zinc-500">{result.endereco}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-[#18181b] px-2 py-0.5 rounded text-yellow-500 border border-zinc-800">
                        <i className="fas fa-star"></i> {result.nota} ({result.reviews})
                      </span>
                      {result.website && (
                        <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                          SITE OK
                        </span>
                      )}
                      {!result.website && (
                        <span className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                          SEM SITE
                        </span>
                      )}
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
                    className={`text-[10px] font-bold px-4 py-2 rounded-full transition ${saved ? 'bg-[#66CC00]/20 text-[#66CC00]' : 'bg-[#27272a] hover:bg-[#333] text-white'}`}
                  >
                    {saved ? <><i className="fas fa-check mr-1"></i> SALVO</> : <><i className="fas fa-plus mr-1"></i> SALVAR</>}
                  </button>
                </div>

                <div className="bg-[#09090b] p-3 rounded-xl border border-zinc-800 mb-4">
                  <p className="text-xs text-zinc-400 italic">
                    <i className="fas fa-lightbulb text-[#66CC00] mr-2"></i>
                    {result.insight}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onOpenAnalysis(result)}
                    className="bg-[#18181b] hover:bg-[#27272a] text-zinc-300 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-800"
                  >
                    <i className="fas fa-microscope text-blue-400"></i> RAIO-X
                  </button>
                  <button 
                    onClick={() => onOpenPitch(result)}
                    className="bg-[#18181b] hover:bg-[#27272a] text-zinc-300 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-800"
                  >
                    <i className="fas fa-comment-dollar text-[#66CC00]"></i> PITCH IA
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && results.length > 0 && (
            <div className="pt-4 pb-8 text-center">
              <button 
                onClick={() => handleScan(true)}
                disabled={loadingMore}
                className="px-8 py-3 bg-[#18181b] hover:bg-[#27272a] text-[#66CC00] border border-[#66CC00]/30 rounded-full text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Buscando Mais Oportunidades...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle"></i>
                    <span>Buscar Mais 10 Leads</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-zinc-600 mt-4 uppercase tracking-widest font-mono">
                Atualmente com {results.length} leads na lista
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
