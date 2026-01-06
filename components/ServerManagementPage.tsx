
import React, { useState, useEffect } from 'react';
import { supabase, saveAuditLog, getClients, getProducts, getCompanies, getProfiles, saveClient, saveProduct, saveCompany, saveProfile } from '../services/supabase';

export const ServerManagementPage: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [localBackupDate, setLocalBackupDate] = useState<string | null>(localStorage.getItem('last_local_backup'));
  const [stats, setStats] = useState({
    clients: 0,
    products: 0,
    companies: 0,
    profiles: 0
  });

  const loadStats = () => {
    const clients = JSON.parse(localStorage.getItem('managed_clients') || '[]');
    const products = JSON.parse(localStorage.getItem('managed_products') || '[]');
    const companies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
    const profiles = JSON.parse(localStorage.getItem('access_profiles') || '[]');
    setStats({
      clients: clients.length,
      products: products.length,
      companies: companies.length,
      profiles: profiles.length
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCloudSync = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Inicie sessão para sincronizar com a nuvem.");
        return;
      }

      // PUSH: Enviar dados locais que possam faltar na nuvem
      const localClients = JSON.parse(localStorage.getItem('managed_clients') || '[]');
      const localProducts = JSON.parse(localStorage.getItem('managed_products') || '[]');
      const localCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
      const localProfiles = JSON.parse(localStorage.getItem('access_profiles') || '[]');

      for (const item of localClients) await saveClient(item);
      for (const item of localProducts) await saveProduct(item);
      for (const item of localCompanies) await saveCompany(item);
      for (const item of localProfiles) await saveProfile(item);

      // PULL: Receber dados actualizados da nuvem
      await getClients();
      await getProducts();
      await getCompanies();
      await getProfiles();
      
      await saveAuditLog({
        userId: session.user.id,
        userName: session.user.user_metadata.full_name || 'Admin',
        action: 'CLOUD_SYNC_COMPLETE',
        details: 'Persistência bidirecional concluída com sucesso entre terminal e nuvem.',
        severity: 'info'
      });
      
      loadStats();
      alert("Nuvem e Terminal sincronizados com sucesso! Os seus dados estão seguros.");
    } catch (e) {
      alert("Erro na sincronização. Verifique a sua ligação.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLocalBackup = () => {
    const data = {
      clients: JSON.parse(localStorage.getItem('managed_clients') || '[]'),
      products: JSON.parse(localStorage.getItem('managed_products') || '[]'),
      companies: JSON.parse(localStorage.getItem('registered_companies') || '[]'),
      profiles: JSON.parse(localStorage.getItem('access_profiles') || '[]'),
      logs: JSON.parse(localStorage.getItem('system_audit_logs') || '[]'),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UniversalSoft_Backup_Integral_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    const now = new Date().toLocaleString();
    setLocalBackupDate(now);
    localStorage.setItem('last_local_backup', now);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
          <i className="fas fa-server text-emerald-600"></i>
          Consola do Servidor
        </h1>
        <p className="text-slate-500 font-medium">Gestão de infraestrutura e persistência entre deploys</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Clientes</p>
          <p className="text-2xl font-black text-slate-800">{stats.clients}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Serviços</p>
          <p className="text-2xl font-black text-slate-800">{stats.products}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Empresas</p>
          <p className="text-2xl font-black text-slate-800">{stats.companies}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl text-white">
          <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Integridade da Nuvem</p>
          <p className="text-2xl font-black text-emerald-400">ACTIVADA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-emerald-600 p-8 text-white flex-1">
             <i className="fas fa-cloud-upload-alt text-4xl mb-4"></i>
             <h3 className="text-xl font-black uppercase tracking-tight">Sincronização Cloud</h3>
             <p className="text-emerald-100 text-sm mt-2 leading-relaxed">Assegura que as configurações de empresa e perfis de acesso sobrevivam a novas actualizações de software e limpezas de cache do navegador.</p>
          </div>
          <div className="p-8 space-y-6 bg-white">
             <button 
               onClick={handleCloudSync}
               disabled={syncing}
               className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition disabled:opacity-50"
             >
               {syncing ? <i className="fas fa-sync fa-spin mr-2"></i> : <i className="fas fa-shield-alt mr-2"></i>}
               Sincronizar e Proteger Dados
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-100 p-8 text-slate-800">
             <i className="fas fa-download text-4xl mb-4 text-slate-400"></i>
             <h3 className="text-xl font-black uppercase tracking-tight">Backup Offline (JSON)</h3>
             <p className="text-slate-500 text-sm mt-2 leading-relaxed">Exporte um snapshot integral para o seu disco rígido como última linha de defesa contra falhas de infraestrutura.</p>
          </div>
          <div className="p-8 space-y-6">
             <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase">Último Registo</span>
                <span className="text-[10px] font-black uppercase text-slate-400">{localBackupDate || 'Pendente'}</span>
             </div>
             <button 
               onClick={handleLocalBackup}
               className="w-full bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition shadow-sm"
             >
               Descarregar Snapshot
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
