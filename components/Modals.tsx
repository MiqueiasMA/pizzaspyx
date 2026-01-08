
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  loading: boolean;
  children: React.ReactNode;
}

export const AnalysisModal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, loading, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181b] w-full max-w-lg rounded-3xl border border-[#27272a] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#27272a] flex justify-between items-center bg-[#121212]">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <i className="fas fa-microscope text-blue-400"></i> {title}
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <i className="fas fa-brain text-4xl text-[#66CC00] animate-pulse"></i>
              <p className="text-sm font-mono text-zinc-500">REALIZANDO RAIO-X ESTRATÉGICO...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export const PitchModal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, loading, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181b] w-full max-w-lg rounded-3xl border border-[#27272a] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#27272a] flex justify-between items-center bg-[#121212]">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <i className="fas fa-magic text-[#66CC00]"></i> {title}
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <i className="fas fa-comment-dollar text-4xl text-[#66CC00] animate-pulse"></i>
              <p className="text-sm font-mono text-zinc-500">GERANDO PITCH DE ALTA CONVERSÃO...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};
