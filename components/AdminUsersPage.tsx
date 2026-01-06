
import React, { useState, useEffect } from 'react';
import { saveAuditLog } from '../services/supabase';
import { AccessProfile } from '../types';

interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      // Carregar Perfis Primeiro
      const savedProfiles = JSON.parse(localStorage.getItem('access_profiles') || '[]');
      setProfiles(savedProfiles);

      // Carregar Utilizadores e realizar Migração de Role IDs se necessário
      const savedUsers = JSON.parse(localStorage.getItem('managed_system_users') || '[]');
      
      let initialUsers: SystemUser[] = [];
      if (savedUsers.length === 0) {
        initialUsers = [
          {
            id: 'admin-master',
            email: 'admin@universal-soft.com',
            fullName: 'Administrador Mestre',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ];
      } else {
        // Migrar utilizadores que tinham cargos antigos para o novo cargo padrão
        initialUsers = savedUsers.map((u: SystemUser) => {
          if (u.role === 'op_aduaneiro' || u.role === 'contabilista') {
            return { ...u, role: 'admin_sistema' };
          }
          return u;
        });
      }

      localStorage.setItem('managed_system_users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'pending' : 'active';
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    
    setUsers(updatedUsers);
    localStorage.setItem('managed_system_users', JSON.stringify(updatedUsers));

    await saveAuditLog({
      userId: 'admin-master',
      userName: 'Administrador',
      action: 'USER_STATUS_CHANGE',
      details: `Utilizador ${userId} alterado para ${newStatus.toUpperCase()}`,
      severity: newStatus === 'active' ? 'info' : 'warning'
    });
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    localStorage.setItem('managed_system_users', JSON.stringify(updatedUsers));

    await saveAuditLog({
      userId: 'admin-master',
      userName: 'Administrador',
      action: 'USER_ROLE_ASSIGNED',
      details: `Atribuído perfil "${newRole}" ao utilizador ${userId}`,
      severity: 'info'
    });

    alert("Perfil de acesso actualizado com sucesso.");
  };

  if (loading) return (
    <div className="p-20 text-center">
      <i className="fas fa-circle-notch fa-spin text-blue-600 text-3xl"></i>
    </div>
  );

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-user-shield text-blue-600"></i>
            Gestão de Utilizadores
          </h1>
          <p className="text-slate-500 font-medium">Controlo central de acessos e cargos administrativos.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilizadores do Sistema</h3>
          <span className="text-[9px] font-black text-blue-600 uppercase">Total: {users.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4">Utilizador / E-mail</th>
                <th className="px-6 py-4">Perfil Atribuído</th>
                <th className="px-6 py-4">Registo</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${user.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase leading-none">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.email === 'admin@universal-soft.com' ? (
                       <span className="text-[8px] font-black uppercase bg-slate-900 text-white px-3 py-1 rounded-lg">Admin Mestre</span>
                    ) : (
                      <select 
                        value={user.role} 
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-tight outline-none focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="user" disabled={user.role !== 'user' && !!user.role}>Acesso Limitado</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-bold">
                    {new Date(user.createdAt).toLocaleDateString('pt-AO')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      <i className={`fas ${user.status === 'active' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                      {user.status === 'active' ? 'Activo' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.email !== 'admin@universal-soft.com' && (
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md ${
                          user.status === 'active' 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspender' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center gap-6">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg shadow-blue-200">
          <i className="fas fa-shield-alt"></i>
        </div>
        <div className="text-[11px] text-blue-800 font-medium leading-relaxed">
          <p className="font-black uppercase text-[12px] mb-1">Nota de Segurança:</p>
          Os perfis técnicos anteriores foram consolidados no perfil <strong>"Administrador do sistema"</strong>. Pode personalizar as permissões deste perfil ou criar novos na página correspondente.
        </div>
      </div>
    </div>
  );
};
