
import React, { useState, useEffect } from 'react';
import { Broker, DEFAULT_BROKER } from '../types';
import { signUpUser, getCompanies, saveCompany as saveToSupabase } from '../services/supabase';

interface Props {
  onSelectActive: (company: Broker) => void;
  activeCompanyId: string;
  isAdmin: boolean;
}

export const AdminCompaniesPage: React.FC<Props> = ({ onSelectActive, activeCompanyId, isAdmin }) => {
  const [companies, setCompanies] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Broker>(DEFAULT_BROKER);

  const [showUserForm, setShowUserForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data.length > 0 ? data : [DEFAULT_BROKER]);
      setLoading(false);
    };
    load();
  }, []);

  const canAddMore = isAdmin || companies.length === 0;

  const handleSetAsActive = (company: Broker) => {
    if (company.status !== 'active' && !isAdmin) {
      alert("ERRO: Esta empresa aguarda activação pelo Administrador para ser utilizada.");
      return;
    }
    onSelectActive(company);
    localStorage.setItem('active_company_id', company.id);
    alert(`Empresa "${company.nome}" activada com sucesso para facturação!`);
  };

  const handleApproveCompany = async (companyId: string) => {
    if (!isAdmin) return;
    const updated = companies.map(c => c.id === companyId ? { 
      ...c, 
      status: 'active' as const,
      activatedAt: new Date().toISOString(),
      activatedBy: 'Admin'
    } : c);
    
    const target = updated.find(c => c.id === companyId);
    if (target) {
      await saveToSupabase(target);
      setCompanies(updated);
      alert("Empresa aprovada e activada para emissão de documentos!");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert("O logótipo deve ter no máximo 1MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const updated = { ...formData, id: editingId };
        await saveToSupabase(updated);
        setCompanies(prev => prev.map(c => c.id === editingId ? updated : c));
        alert("Dados da empresa actualizados!");
        setEditingId(null);
      } else {
        if (!canAddMore) {
          alert("Limite Atingido: O seu perfil permite o registo de apenas uma empresa.");
          return;
        }
        
        const newId = crypto.randomUUID?.() || `id-${Date.now()}`;
        const newCompany: Broker = { 
          ...formData, 
          id: newId, 
          status: isAdmin ? 'active' : 'pending' 
        };
        await saveToSupabase(newCompany);
        setCompanies(prev => [...prev, newCompany]);
        alert(isAdmin ? "Empresa cadastrada e activa!" : "Empresa cadastrada! Aguarde a activação pelo Administrador.");
      }
      setFormData(DEFAULT_BROKER);
    } catch (err) {
      alert("Erro ao salvar empresa: Conecte-se à internet para garantir a persistência.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    try {
      await signUpUser(userEmail, userPassword, userName);
      alert("Utilizador criado com sucesso! Estado: Pendente.");
      setShowUserForm(false);
      setUserEmail(''); setUserPassword(''); setUserName('');
    } catch (error: any) {
      alert("Erro ao criar utilizador: " + error.message);
    } finally {
      setUserLoading(false);
    }
  };

  const startNewCompany = () => {
    setEditingId(null);
    setFormData({ ...DEFAULT_BROKER, id: '', nome: '', nif: '', endereco: '', logoUrl: '', status: 'pending' });
  };

  if (loading) return <div className="p-20 text-center"><i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-building text-blue-600"></i>
            Identificação da Empresa
          </h1>
          <p className="text-slate-500 font-medium">Gestão de Emitentes (Persistência na Nuvem Activa)</p>
        </div>
        {!editingId && canAddMore && (
          <button 
            onClick={startNewCompany} 
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition"
          >
            + Nova Empresa
          </button>
        )}
      </div>

      {!isAdmin && companies.length > 0 && !editingId && (
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-2xl border border-slate-800">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg">
               <i className="fas fa-info-circle"></i>
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Limite de Conta</p>
               <p className="text-sm font-bold text-slate-200">O seu perfil de acesso permite gerir apenas uma entidade emitente.</p>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Razão Social / Nome da Empresa</label>
                <input required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm focus:border-blue-500 outline-none font-bold" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">NIF</label>
                <input required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none font-mono focus:border-blue-500" value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Regime Fiscal</label>
                <select className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none bg-white font-bold" value={formData.regimeFiscal} onChange={e => setFormData({...formData, regimeFiscal: e.target.value as any})}>
                  <option value="GERAL">Regime Geral (IVA 14%)</option>
                  <option value="EXCLUSAO">Regime de Exclusão (IVA 0%)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Endereço e Contactos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Endereço Completo</label>
                  <textarea required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none h-20 focus:border-blue-500 transition-all resize-none" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Telefone Principal</label>
                  <input required className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none focus:border-blue-500" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Email Corporativo</label>
                  <input required type="email" className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Dados Bancários</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Instituição Bancária</label>
                  <input className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none font-bold" value={formData.bancoNome} onChange={e => setFormData({...formData, bancoNome: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">IBAN</label>
                  <input required className="w-full border-2 border-blue-50 p-3 rounded-xl text-sm font-mono outline-none bg-blue-50/30" value={formData.coordenadasBancarias} onChange={e => setFormData({...formData, coordenadasBancarias: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition">
                {editingId ? 'Actualizar Dados' : 'Finalizar Cadastro'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setFormData(DEFAULT_BROKER); }} 
                  className="px-8 border-2 border-slate-100 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest w-full text-left">Logotipo</h4>
            <div className="w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
              {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-contain p-2" alt="Logo" /> : <i className="fas fa-image text-4xl text-slate-200"></i>}
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                <div className="text-center">
                   <i className="fas fa-camera text-white text-2xl mb-1"></i>
                   <p className="text-[8px] font-black uppercase text-white tracking-widest">Alterar Logo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listagem</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {companies.map(company => (
                <div key={company.id} className={`p-4 transition-all ${activeCompanyId === company.id ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                          {company.logoUrl ? <img src={company.logoUrl} className="w-full h-full object-contain" /> : <i className="fas fa-building text-slate-200 text-xs"></i>}
                       </div>
                       <div>
                         <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">{company.nome}</p>
                         <p className="text-[9px] text-slate-400 font-mono">NIF: {company.nif}</p>
                       </div>
                    </div>
                    {company.status === 'pending' && (
                      <span className="text-[7px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase">Pendente</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {company.status === 'active' ? (
                       <button 
                         onClick={() => handleSetAsActive(company)} 
                         disabled={activeCompanyId === company.id}
                         className={`flex-1 text-[9px] font-black uppercase py-2 rounded-xl transition-all shadow-sm ${activeCompanyId === company.id ? 'bg-emerald-600 text-white cursor-default' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white'}`}
                       >
                         {activeCompanyId === company.id ? 'Activa' : 'Utilizar'}
                       </button>
                    ) : (
                       isAdmin ? (
                         <button 
                           onClick={() => handleApproveCompany(company.id)}
                           className="flex-1 bg-amber-500 text-white text-[9px] font-black uppercase py-2 rounded-xl hover:bg-amber-600 shadow-sm"
                         >
                           Activar
                         </button>
                       ) : (
                         <div className="flex-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase py-2 rounded-xl text-center border border-slate-200 italic">
                           Bloqueado
                         </div>
                       )
                    )}
                    
                    <button 
                      onClick={() => { setEditingId(company.id); setFormData(company); }} 
                      className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600"
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
