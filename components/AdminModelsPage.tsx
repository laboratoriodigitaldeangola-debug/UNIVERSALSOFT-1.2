
import React, { useState, useEffect } from 'react';
import { TemplateId, Invoice } from '../types';
import { getMockInvoiceData } from '../utils/templateAdapter';
import { InvoicePreview } from './InvoicePreview';

interface ModelInfo {
  id: TemplateId;
  name: string;
  code: string;
  desc: string;
}

const MODELS: ModelInfo[] = [
  { id: 'classic', name: 'Modelo Clássico', code: 'CLASSIC', desc: 'Layout tradicional detalhado com quadros fiscais completos.' },
  { id: 'simplified', name: 'Modelo Simplificado', code: 'SIMPLIFIED', desc: 'Layout limpo e compacto para leitura rápida.' },
  { id: 'corporate', name: 'Modelo Corporativo', code: 'CORPORATE', desc: 'Estrutura institucional de alta densidade para grandes contratos.' }
];

interface Props {
  onSelectActiveTemplate?: (id: TemplateId) => void;
}

export const AdminModelsPage: React.FC<Props> = ({ onSelectActiveTemplate }) => {
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>(() => {
    return (localStorage.getItem('active_template_id') as TemplateId) || 'classic';
  });

  const [previewModel, setPreviewModel] = useState<TemplateId | null>(null);

  const handleSetActive = (id: TemplateId) => {
    setActiveTemplateId(id);
    localStorage.setItem('active_template_id', id);
    if (onSelectActiveTemplate) {
      onSelectActiveTemplate(id);
    }
  };

  // Mock data específico para a área administrativa
  const adminMockInvoice: Invoice = {
    ...getMockInvoiceData(),
    numero: "PREVIEW-2025/000",
    client: {
      nome: "ENTIDADE DE TESTE ADM",
      nif: "5000999888",
      endereco: "Zona Económica Especial, Viana, Luanda",
      email: "teste@adm.ao"
    },
    templateId: previewModel || activeTemplateId
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
          <i className="fas fa-layer-group text-blue-600"></i>
          Modelos de Impressão
        </h1>
        <p className="text-slate-500 font-medium">Seleccione o layout padrão para todas as facturas emitidas.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Designação</th>
                <th className="px-6 py-4">Versão XML</th>
                <th className="px-6 py-4 text-center">Estado do Sistema</th>
                <th className="px-6 py-4 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODELS.map(model => (
                <tr key={model.id} className={`transition-colors ${activeTemplateId === model.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{model.name}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{model.desc}</p>
                  </td>
                  <td className="px-6 py-5">
                    <code className="text-[10px] bg-slate-100 px-2 py-1 rounded font-black text-slate-500 uppercase tracking-widest">v2.0-{model.code}</code>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {activeTemplateId === model.id ? (
                      <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse">
                        <i className="fas fa-check-circle"></i> MODELO ACTIVO
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSetActive(model.id)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Definir como Padrão
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setPreviewModel(model.id)}
                      className="bg-white text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <i className="fas fa-eye"></i> Pré-visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-slate-900 rounded-3xl flex items-center gap-6 shadow-2xl relative overflow-hidden group border border-slate-800">
        <div className="absolute top-0 right-0 w-32 h-full bg-blue-600/10 -skew-x-12 translate-x-16 group-hover:translate-x-12 transition-transform duration-700"></div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white text-xl backdrop-blur-md border border-white/10 shrink-0 shadow-inner">
          <i className="fas fa-print"></i>
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Padrão A4 Certificado</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            O modelo marcado como "ACTIVO" será aplicado automaticamente a todas as novas facturas. Garanta que a sua impressora está configurada para papel A4 sem escalas.
          </p>
        </div>
      </div>

      {/* Modal de Pré-visualização */}
      {previewModel && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-2 md:p-8 animate-in fade-in zoom-in duration-300">
          <div className="bg-white w-full max-w-5xl h-full md:h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl border border-white/10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-search-plus"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Inspecção de Layout</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      Visualizando: {MODELS.find(m => m.id === previewModel)?.name}
                    </p>
                  </div>
               </div>
               <button 
                 onClick={() => setPreviewModel(null)}
                 className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-all border border-slate-100"
               >
                 <i className="fas fa-times text-lg"></i>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center p-4 md:p-12 scrollbar-hide">
               <div className="origin-top transform transition-transform duration-500 scale-[0.6] sm:scale-[0.7] md:scale-[0.85] lg:scale-90 shadow-2xl">
                  <InvoicePreview invoice={adminMockInvoice} />
               </div>
            </div>

            <div className="bg-slate-900 p-4 text-center border-t border-slate-800 shrink-0">
               <div className="flex justify-center gap-8 items-center opacity-60">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]"><i className="fas fa-check-circle mr-2"></i> Padrão AGT 2025</span>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]"><i className="fas fa-shield-alt mr-2"></i> Assinatura Digital</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
