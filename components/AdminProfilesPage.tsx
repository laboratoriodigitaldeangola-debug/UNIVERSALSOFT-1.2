
import React, { useState, useEffect } from 'react';
import { AccessProfile, Permission } from '../types';
import { saveAuditLog, getProfiles, saveProfile as saveToSupabase } from '../services/supabase';

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'inv_view', label: 'Visualizar Facturas', module: 'Facturação', description: 'Permite consultar o histórico de facturas.' },
  { id: 'inv_create', label: 'Emitir Facturas', module: 'Facturação', description: 'Permite criar e baixar novas facturas PDF.' },
  { id: 'cli_manage', label: 'Gerir Clientes', module: 'Base de Dados', description: 'Permite criar, editar e remover clientes.' },
  { id: 'prod_manage', label: 'Gerir Serviços', module: 'Base de Dados', description: 'Permite gerir o catálogo de honorários.' },
  { id: 'saft_export', label: 'Exportar SAF-T', module: 'Fiscal', description: 'Permite gerar ficheiros XML para a AGT.' },
  { id: 'admin_users', label: 'Gerir Utilizadores', module: 'Administração', description: 'Permite activar/suspender contas.' },
  { id: 'admin_audit', label: 'Ver Auditoria', module: 'Administração', description: 'Acesso aos logs de segurança e stress test.' },
  { id: 'admin_settings', label: 'Configurações Globais', module: 'Administração', description: 'Alterar dados da empresa.' },
  { id: 'admin_server', label: 'Servidor & Backups', module: 'Infraestrutura', description: 'Gestão de backups na nuvem e snaphosts locais.' },
  { id: 'admin_models', label: 'Layouts A4', module: 'Design', description: 'Configuração dos modelos de impressão das facturas.' },
];

export const AdminProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<AccessProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getProfiles();
      
      // Garantir perfis de sistema básicos
      const systemProfiles = [
        { 
          id: 'admin', 
          name: 'Administrador Total', 
          description: 'Acesso completo e irrestrito.', 
          permissions: AVAILABLE_PERMISSIONS.map(p => p.id), 
          isSystem: true 
        },
        { 
          id: 'admin_sistema', 
          name: 'Administrador do sistema', 
          description: 'Perfil administrativo padrão.', 
          permissions: ['inv_view', 'inv_create', 'cli_manage', 'prod_manage', 'saft_export'], 
          isSystem: false 
        }
      ];

      if (data.length === 0) {
        setProfiles(systemProfiles);
        // Gravar no Supabase se logado
        systemProfiles.forEach(p => saveToSupabase(p));
      } else {
        setProfiles(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      await saveToSupabase(editingProfile);
      
      let updatedProfiles;
      if (profiles.find(p => p.id === editingProfile.id)) {
        updatedProfiles = profiles.map(p => p.id === editingProfile.id ? editingProfile : p);
      } else {
        updatedProfiles = [...profiles, editingProfile];
      }

      setProfiles(updatedProfiles);
      setIsFormOpen(false);
      setEditingProfile(null);
      
      saveAuditLog({
        userId: 'admin-master',
        userName: 'Administrador',
        action: 'PROFILE_UPDATED',
        details: `Perfil ${editingProfile.name} sincronizado com a nuvem.`,
        severity: 'info'
      });
    } catch (err) {
      alert("Erro ao sincronizar perfil. Tente novamente mais tarde.");
    }
  };

  const togglePermission = (permId: string) => {
    if (!editingProfile) return;
    const hasPerm = editingProfile.permissions.includes(permId);
    const newPerms = hasPerm 
      ? editingProfile.permissions.filter(id => id !== permId)
      : [...editingProfile.permissions, permId];
    setEditingProfile({ ...editingProfile, permissions: newPerms });
  };

  const toggleAllPermissions = () => {
    if (!editingProfile) return;
    const allIds = AVAILABLE_PERMISSIONS.map(p => p.id);
    const isAllSelected = editingProfile.permissions.length === allIds.length;
    setEditingProfile({ ...editingProfile, permissions: isAllSelected ? [] : allIds });
  };

  const startNew = () => {
    setEditingProfile({ id: 'prof-' + Date.now(), name: '', description: '', permissions: [] });
    setIsFormOpen(true);
  };

  const startEdit = (profile: AccessProfile) => {
    setEditingProfile(profile);
    setIsFormOpen(true);
  };

  if (loading) return <div className="p-20 text-center"><i className="fas fa-sync fa-spin text-3xl text-indigo-600"></i></div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-user-lock text-indigo-600"></i>
            Perfis de Acesso
          </h1>
          <p className="text-slate-500 font-medium">Controlo centralizado com Backup na Nuvem Activo.</p>
        </div>
        <button onClick={startNew} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition">
           + Criar Novo Perfil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <div key={profile.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between group">
            <div>
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${profile.isSystem ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <i className={`fas ${profile.isSystem ? 'fa-shield-alt' : 'fa-user-cog'}`}></i>
                  </div>
                  {profile.isSystem && (
                    <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-400">Sistema</span>
                  )}
               </div>
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{profile.name}</h3>
               <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{profile.description}</p>
            </div>
            
            <button 
              onClick={() => startEdit(profile)}
              className="mt-8 w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all"
            >
              Configurar Perfil
            </button>
          </div>
        ))}
      </div>

      {isFormOpen && editingProfile && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Configurar Perfil</h2>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-rose-500 text-xl"><i className="fas fa-times"></i></button>
             </div>

             <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Nome do Perfil</label>
                      <input 
                        required 
                        className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        value={editingProfile.name}
                        onChange={e => setEditingProfile({...editingProfile, name: e.target.value})}
                        disabled={editingProfile.isSystem}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Descrição</label>
                      <input 
                        required 
                        className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        value={editingProfile.description}
                        onChange={e => setEditingProfile({...editingProfile, description: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matriz de Permissões</h3>
                     <button 
                        type="button" 
                        onClick={toggleAllPermissions}
                        className="text-[9px] font-black uppercase text-indigo-600 flex items-center gap-2"
                        disabled={editingProfile.isSystem}
                     >
                       <i className={`fas ${editingProfile.permissions.length === AVAILABLE_PERMISSIONS.length ? 'fa-minus-square' : 'fa-check-square'}`}></i>
                       Alternar Todas
                     </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <div 
                          key={perm.id} 
                          onClick={() => !editingProfile.isSystem && togglePermission(perm.id)}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                            editingProfile.permissions.includes(perm.id) 
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                            : 'bg-white border-slate-50 hover:border-slate-200'
                          } ${editingProfile.isSystem ? 'opacity-80 cursor-default' : ''}`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${editingProfile.permissions.includes(perm.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <i className="fas fa-check"></i>
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-800 uppercase leading-none">{perm.label}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </form>

             <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
                <button 
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
                >
                  Gravar e Sincronizar
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
