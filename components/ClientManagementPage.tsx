
import React, { useState, useEffect } from 'react';
import { ManagedClient } from '../types';
import { getClients, saveClient, deleteClient } from '../services/supabase';

interface Toast {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

export const ClientManagementPage: React.FC = () => {
  const [clients, setClients] = useState<ManagedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<Toast>({ message: '', type: 'success', visible: false });
  
  const [formData, setFormData] = useState<Omit<ManagedClient, 'id'>>({
    tipo: 'colectivo',
    nome: '',
    nif: '',
    endereco: '',
    status: 'active'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const fetchClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || crypto.randomUUID();
    const clientData: ManagedClient = { ...formData, id };
    
    try {
      await saveClient(clientData);
      setEditingId(null);
      setFormData({ tipo: 'colectivo', nome: '', nif: '', endereco: '', status: 'active' });
      await fetchClients();
      showToast(editingId ? "Dados actualizados com sucesso!" : "Cliente registado com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao gravar cliente. Verifique a sua ligação.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem a certeza que deseja remover este cliente permanentemente?")) {
      try {
        await deleteClient(id);
        await fetchClients();
        showToast("Cliente removido permanentemente.", "success");
      } catch (err) {
        showToast("Erro ao remover cliente.", "error");
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nif.includes(searchTerm)
  );

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-10 right-10 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right duration-500 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-users text-blue-600"></i>
            Cadastro de Clientes
          </h1>
          <p className="text-slate-500 font-medium">Controlo simplificado de entidades adquirentes (Sincronizado na Nuvem)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-8">
            <div className="bg-slate-900 p-6 border-b border-slate-800">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
                {editingId ? 'Actualizar Registo' : 'Ficha de Novo Cliente'}
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tipo de Entidade</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, tipo: 'colectivo'})}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${formData.tipo === 'colectivo' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
                  >
                    Colectivo
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, tipo: 'individual'})}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${formData.tipo === 'individual' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
                  >
                    Individual
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome Completo / Razão Social</label>
                <input required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:border-blue-500 transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NIF (Número de Contribuinte)</label>
                <input required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none font-mono focus:border-blue-500 transition-all" value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Endereço Fiscal</label>
                <textarea required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none h-24 resize-none focus:border-blue-500 transition-all" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl mt-2 disabled:opacity-50">
                {loading ? <i className="fas fa-spinner fa-spin"></i> : (editingId ? 'Gravar Alterações' : 'Confirmar Cadastro')}
              </button>
              
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ tipo: 'colectivo', nome: '', nif: '', endereco: '', status: 'active' }); }} className="w-full border border-slate-200 text-slate-400 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[50%] bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex gap-4 animate-in slide-in-from-top duration-700">
               <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input 
                    placeholder="Pesquisar por nome ou NIF..." 
                    className="w-full bg-slate-50 border-none pl-11 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               {loading && <div className="flex items-center px-4"><i className="fas fa-sync fa-spin text-blue-600"></i></div>}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Nome do Cliente</th>
                  <th className="px-6 py-4">NIF</th>
                  <th className="px-6 py-4 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.length === 0 && !loading ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Nenhum cliente encontrado</td></tr>
                ) : filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${client.tipo === 'colectivo' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {client.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{client.nome}</p>
                      <p className="text-[9px] text-slate-400 truncate max-w-xs italic">{client.endereco}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{client.nif}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingId(client.id); setFormData(client); }} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition inline-flex items-center justify-center">
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition inline-flex items-center justify-center">
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
