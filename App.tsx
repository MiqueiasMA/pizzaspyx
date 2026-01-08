
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import CRM from './components/CRM';
import { AnalysisModal, PitchModal } from './components/Modals';
import { Lead, LeadStatus } from './types';
import { geminiService } from './services/geminiService';

const DB_KEY = 'pizzaspy_leads_v3';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [pitchData, setPitchData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) setLeads(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(leads));
  }, [leads]);

  const saveLead = (lead: Lead) => {
    if (leads.find(l => l.nome === lead.nome)) return;
    setLeads([lead, ...leads]);
  };

  const deleteLead = (id: string) => {
    if (window.confirm('Excluir este lead?')) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };

  const isLeadSaved = (nome: string) => leads.some(l => l.nome === nome);

  const handleOpenAnalysis = async (lead: any) => {
    setSelectedLead(lead);
    setAnalysisOpen(true);
    setModalLoading(true);
    setAnalysisData(null);
    try {
      const data = await geminiService.generateAnalysis(lead.nome, lead.endereco);
      setAnalysisData(data);
    } catch (e) {
      alert('Erro ao carregar análise profunda.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenPitch = async (lead: any) => {
    setSelectedLead(lead);
    setPitchOpen(true);
    setModalLoading(true);
    setPitchData(null);
    try {
      const data = await geminiService.generatePitch(lead.nome, lead.insight);
      setPitchData(data);
    } catch (e) {
      alert('Erro ao gerar pitch.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!selectedLead || !pitchData) return;
    const phone = selectedLead.whatsapp || '';
    const text = encodeURIComponent(pitchData.mensagem);
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      navigator.clipboard.writeText(pitchData.mensagem);
      alert('Mensagem copiada para transferência!');
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} leadsCount={leads.length}>
      {activeTab === 'scanner' && (
        <Scanner 
          onSaveLead={saveLead} 
          isLeadSaved={isLeadSaved}
          onOpenAnalysis={handleOpenAnalysis}
          onOpenPitch={handleOpenPitch}
        />
      )}
      {activeTab === 'crm' && (
        <CRM 
          leads={leads} 
          onDelete={deleteLead} 
          onUpdateStatus={updateStatus}
          onOpenAnalysis={handleOpenAnalysis}
          onOpenPitch={handleOpenPitch}
        />
      )}

      <AnalysisModal 
        isOpen={analysisOpen} 
        onClose={() => setAnalysisOpen(false)}
        title="Raio-X Inteligente"
        subtitle={selectedLead?.nome || ''}
        loading={modalLoading}
      >
        <div className="space-y-6">
          {/* Ficha Cadastral (CNPJ / Dono) */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="fas fa-id-card"></i> Dados Corporativos (Estimados)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-zinc-500">PROPRIETÁRIO</p>
                <p className="text-sm text-zinc-200 font-medium">{analysisData?.proprietario || 'Não localizado'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500">CNPJ</p>
                <p className="text-sm text-zinc-200 font-medium">{analysisData?.cnpj || 'Não localizado'}</p>
              </div>
            </div>
          </div>

          {/* SWOT Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a2e1a] p-3 rounded-xl border border-green-500/10">
              <h4 className="text-[10px] font-bold text-green-400 uppercase mb-2">Forças</h4>
              <ul className="text-[11px] text-zinc-300 space-y-1">
                {analysisData?.fortes?.map((f: any, i: number) => <li key={i}>• {f}</li>)}
              </ul>
            </div>
            <div className="bg-[#2e1a1a] p-3 rounded-xl border border-red-500/10">
              <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Fraquezas</h4>
              <ul className="text-[11px] text-zinc-300 space-y-1">
                {analysisData?.fracos?.map((f: any, i: number) => <li key={i}>• {f}</li>)}
              </ul>
            </div>
            <div className="bg-[#2e2e1a] p-3 rounded-xl border border-yellow-500/10">
              <h4 className="text-[10px] font-bold text-yellow-400 uppercase mb-2">Oportunidades</h4>
              <ul className="text-[11px] text-zinc-300 space-y-1">
                {analysisData?.oportunidades?.map((f: any, i: number) => <li key={i}>• {f}</li>)}
              </ul>
            </div>
            <div className="bg-[#271a2e] p-3 rounded-xl border border-purple-500/10">
              <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-2">Ameaças</h4>
              <ul className="text-[11px] text-zinc-300 space-y-1">
                {analysisData?.ameacas?.map((f: any, i: number) => <li key={i}>• {f}</li>)}
              </ul>
            </div>
          </div>

          {/* Comparativo Concorrência */}
          <div className="bg-[#18181b] p-4 rounded-xl border border-blue-500/10">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Análise de Vizinhança</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {analysisData?.comparativoConcorrencia}
            </p>
          </div>

          {/* Argumento Matador */}
          <div className="bg-[#66CC00]/10 p-5 rounded-2xl border border-[#66CC00]/20">
            <h4 className="text-[10px] font-bold text-[#66CC00] uppercase tracking-widest mb-2">Oportunidade de Ouro</h4>
            <p className="text-sm text-zinc-100 font-semibold italic">
              "{analysisData?.ouro}"
            </p>
          </div>
        </div>
      </AnalysisModal>

      <PitchModal
        isOpen={pitchOpen}
        onClose={() => setPitchOpen(false)}
        title="Proposta Irresistível"
        subtitle={selectedLead?.nome || ''}
        loading={modalLoading}
      >
        <div className="space-y-6">
          <div className="bg-[#09090b] p-6 rounded-2xl border border-zinc-800 relative group shadow-inner">
            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {pitchData?.mensagem}
            </p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(pitchData?.mensagem);
                alert('Mensagem copiada!');
              }}
              className="absolute top-4 right-4 text-zinc-600 hover:text-[#66CC00] transition"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <button 
            onClick={handleSendToWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
          >
            <i className="fab fa-whatsapp text-xl"></i>
            <span className="uppercase tracking-wider text-sm">Chamar no WhatsApp</span>
          </button>
        </div>
      </PitchModal>
    </Layout>
  );
};

export default App;
