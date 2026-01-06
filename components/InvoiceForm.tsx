
import React, { useState, useEffect } from 'react';
import { Invoice, Broker, Client, InvoiceItem, ManagedClient, ManagedProduct } from '../types';
import { saveAuditLog, getClients, getProducts } from '../services/supabase';

interface Props {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  onGenerateAI: () => void;
  isGenerating: boolean;
  userProfile?: any;
}

export const InvoiceForm: React.FC<Props> = ({ invoice, onChange, onGenerateAI, isGenerating, userProfile }) => {
  const [managedClients, setManagedClients] = useState<ManagedClient[]>([]);

  useEffect(() => {
    const loadManagedData = async () => {
      const clients = await getClients();
      setManagedClients(clients.filter((c: ManagedClient) => c.status === 'active'));
    };
    loadManagedData();
  }, [invoice.broker.id]);

  const validateNIF = (nif: string) => /^[0-9]{9}$/.test(nif.trim());
  const updateClient = (field: keyof Client, value: string) => onChange({ ...invoice, client: { ...invoice.client, [field]: value } });
  
  const handleSelectManagedClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = managedClients.find(c => c.id === e.target.value);
    if (selected) onChange({ ...invoice, client: { nome: selected.nome, nif: selected.nif, endereco: selected.endereco, email: selected.email || "" } });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = invoice.items.map(item => item.id === id ? { ...item, [field]: value } : item);
    onChange({ ...invoice, items: newItems });
  };

  const addItem = () => onChange({ ...invoice, items: [...invoice.items, { id: Math.random().toString(36).substr(2, 9), descricao: "Item de Serviço / Produto", quantidade: 1, precoUnitario: 0 }] });
  const removeItem = (id: string) => invoice.items.length > 1 && onChange({ ...invoice, items: invoice.items.filter(i => i.id !== id) });

  const handleDownloadPDF = async () => {
    if (invoice.broker.status !== 'active') { alert("ERRO CRÍTICO: Emitente não autorizado."); return; }
    if (!validateNIF(invoice.client.nif)) { alert("ERRO: NIF do cliente inválido."); return; }
    if (!invoice.client.nome) { alert("ERRO: Nome do cliente obrigatório."); return; }

    const element = document.querySelector('.invoice-container');
    if (!element) return;
    
    const opt = { margin: 0, filename: `FT_${invoice.numero.replace(/\//g, '-')}.pdf`, image: { type: 'jpeg', quality: 1.0 }, html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    await saveAuditLog({ userId: userProfile?.id || 'anon', userName: userProfile?.name || 'Sistema', action: 'INVOICE_EMISSION', details: `Emissão de ${invoice.numero} para ${invoice.client.nome}.`, severity: 'info' });
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 no-print overflow-x-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs"><i className="fas fa-print"></i></div>
          Ações de Facturação
        </h2>
        <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownloadPDF} className="px-3 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-lg"><i className="fas fa-file-export"></i> Emitir PDF</button>
            <button onClick={() => window.print()} className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-3 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"><i className="fas fa-print"></i> Imprimir</button>
        </div>
      </div>
      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><i className="fas fa-id-card text-blue-500"></i> Emitente</h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs font-black text-slate-800 uppercase leading-none">{invoice.broker.nome}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">NIF: {invoice.broker.nif}</p>
          <p className="text-[10px] font-black text-blue-600 uppercase mt-2">Nº Doc: {invoice.numero}</p>
        </div>
      </section>
      <section className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</h3>{managedClients.length > 0 && (<select className="text-[9px] font-black uppercase bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg" onChange={handleSelectManagedClient} defaultValue=""><option value="" disabled>Histórico</option>{managedClients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>)}</div>
        <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
          <input placeholder="Nome ou Razão Social" className="w-full border-2 border-white p-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:border-blue-200" value={invoice.client.nome} onChange={e => updateClient('nome', e.target.value)} />
          <input placeholder="NIF (9 dígitos)" maxLength={9} className="w-full border-2 border-white p-3 rounded-xl text-sm shadow-sm outline-none focus:border-blue-200" value={invoice.client.nif} onChange={e => updateClient('nif', e.target.value.replace(/\D/g, ''))} />
        </div>
      </section>
      <section className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Linhas de Facturação</h3><button onClick={addItem} className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-lg uppercase font-black">+ Adicionar</button></div>
        <div className="space-y-3">
          {invoice.items.map((item) => (
            <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group transition-all hover:border-blue-200">
              <input className="w-full border-2 border-white p-2 rounded-lg text-xs font-bold mb-2 outline-none focus:border-blue-400" value={item.descricao} onChange={e => updateItem(item.id, 'descricao', e.target.value)} />
              <div className="grid grid-cols-2 gap-2"><input type="number" className="w-full border-2 border-white p-2 rounded-lg text-xs text-center font-black" value={item.quantidade} onChange={e => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)} /><input type="number" className="w-full border-2 border-white p-2 rounded-lg text-xs font-bold" value={item.precoUnitario} onChange={e => updateItem(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)} /></div>
              <button onClick={() => removeItem(item.id)} className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 text-red-500 bg-white w-6 h-6 rounded-full shadow-lg border border-red-50 flex items-center justify-center transition-all"><i className="fas fa-times text-[10px]"></i></button>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Observações</h3><button onClick={onGenerateAI} disabled={isGenerating} className="text-[9px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg uppercase font-black flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 shadow-md">{isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>} Refinar com IA</button></div>
        <textarea className="w-full border-2 border-slate-100 p-3 rounded-xl text-xs outline-none focus:border-blue-500 transition-all min-h-[80px] font-medium" value={invoice.notas} onChange={e => onChange({...invoice, notas: e.target.value})} />
      </section>
    </div>
  );
};
