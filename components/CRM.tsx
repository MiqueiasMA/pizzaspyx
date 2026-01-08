
import React from 'react';
import { Lead, LeadStatus } from '../types';

interface CRMProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onOpenAnalysis: (lead: Lead) => void;
  onOpenPitch: (lead: Lead) => void;
}

const CRM: React.FC<CRMProps> = ({ leads, onDelete, onUpdateStatus, onOpenAnalysis, onOpenPitch }) => {
  const getStatusStyle = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'bg-zinc-700 text-white';
      case LeadStatus.CONTACTED: return 'bg-yellow-500 text-black';
      case LeadStatus.NEGOTIATING: return 'bg-blue-500 text-white';
      case LeadStatus.CONVERTED: return 'bg-[#66CC00] text-black';
      default: return 'bg-zinc-800';
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'Novo';
      case LeadStatus.CONTACTED: return 'Contactado';
      case LeadStatus.NEGOTIATING: return 'Negociando';
      case LeadStatus.CONVERTED: return 'Fechado';
      default: return status;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-address-book text-[#66CC00]"></i> Gestão de Leads
          </h2>
          <span className="text-[10px] text-zinc-500 font-mono">LOCAL STORAGE ACTIVE</span>
        </div>

        {leads.length === 0 ? (
          <div className="py-24 text-center glass-panel rounded-3xl opacity-30 border-dashed border-zinc-700">
            <i className="fas fa-inbox text-5xl mb-4"></i>
            <p>Sua lista de leads está vazia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="glass-panel p-5 rounded-2xl border-zinc-800 hover:border-zinc-700 transition relative group">
                <button 
                  onClick={() => onDelete(lead.id)}
                  className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <button 
                    onClick={() => {
                      const stages = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.NEGOTIATING, LeadStatus.CONVERTED];
                      const currentIdx = stages.indexOf(lead.status);
                      const nextStatus = stages[(currentIdx + 1) % stages.length];
                      onUpdateStatus(lead.id, nextStatus);
                    }}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition ${getStatusStyle(lead.status)}`}
                  >
                    {getStatusLabel(lead.status)}
                  </button>
                  <span className="text-[10px] text-zinc-600 font-mono">{lead.dateAdded}</span>
                </div>

                <h3 className="font-bold text-lg text-white mb-1 pr-8">{lead.nome}</h3>
                <p className="text-xs text-zinc-500 mb-4 flex items-center gap-1">
                  <i className="fas fa-map-marker-alt"></i> {lead.endereco}
                </p>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <i className="fab fa-whatsapp text-green-500 w-4"></i>
                    <span>{lead.whatsapp || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <i className="fas fa-globe text-blue-400 w-4"></i>
                    <span className="truncate">{lead.website || 'Sem website'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onOpenAnalysis(lead)}
                    className="bg-[#27272a] hover:bg-[#333] text-zinc-300 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-microscope text-blue-400"></i> ANÁLISE
                  </button>
                  <button 
                    onClick={() => onOpenPitch(lead)}
                    className="bg-[#27272a] hover:bg-[#333] text-zinc-300 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-comment-dollar text-[#66CC00]"></i> PITCH
                  </button>
                </div>
                
                {lead.whatsapp && (
                  <a 
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-3 block w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] py-2.5 rounded-xl text-xs font-bold text-center transition border border-[#25D366]/20"
                  >
                    <i className="fab fa-whatsapp mr-2"></i> ABRIR WHATSAPP
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CRM;
