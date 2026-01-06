
import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, INITIAL_INVOICE, Broker, TemplateId } from './types';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { generateProfessionalNote } from './services/geminiService';
import { AuthPage } from './components/AuthPage';
import { AdminModelsPage } from './components/AdminModelsPage';
import { AdminCompaniesPage } from './components/AdminCompaniesPage';
import { AdminUsersPage } from './components/AdminUsersPage';
import { AdminProfilesPage } from './components/AdminProfilesPage';
import { AdminStressTestPage } from './components/AdminStressTestPage';
import { ClientManagementPage } from './components/ClientManagementPage';
import { ProductManagementPage } from './components/ProductManagementPage';
import { SaftSubmissionPage } from './components/SaftSubmissionPage';
import { ServerManagementPage } from './components/ServerManagementPage';
import { supabase, signOutUser, saveAuditLog } from './services/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'invoicing' | 'admin-models' | 'admin-companies' | 'admin-users' | 'admin-profiles' | 'admin-stress' | 'clients' | 'products' | 'saft' | 'server'>('invoicing');
  
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const saved = localStorage.getItem('last_invoice');
    const initial = saved ? JSON.parse(saved) : INITIAL_INVOICE;
    const activeTemplate = localStorage.getItem('active_template_id') as TemplateId;
    if (activeTemplate) initial.templateId = activeTemplate;
    return initial;
  });

  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: realSession } } = await supabase.auth.getSession();
      if (realSession) setSession(realSession);
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLoginSuccess = (newSession: any) => setSession(newSession);

  const userProfile = useMemo(() => {
    if (!session?.user) return null;
    const meta = session.user.user_metadata || {};
    const email = session.user.email || "";
    const isEmailAdmin = email.toLowerCase().startsWith('admin@');
    return {
      id: session.user.id,
      email,
      name: meta.full_name || email.split('@')[0],
      role: meta.role || (isEmailAdmin ? 'admin' : 'user'),
      status: meta.status || (isEmailAdmin ? 'active' : 'pending'),
      isAdmin: (meta.role === 'admin') || isEmailAdmin
    };
  }, [session]);

  const handleAINotes = async () => {
    setIsGeneratingNote(true);
    const subtotal = invoice.items.reduce((s,i) => s + (i.quantidade*i.precoUnitario), 0);
    const context = `Factura comercial para ${invoice.client.nome}. Valor: ${subtotal} AOA.`;
    const newNote = await generateProfessionalNote(context);
    setInvoice(prev => ({ ...prev, notas: newNote }));
    setIsGeneratingNote(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('universalsoft_demo_session');
    await signOutUser();
    setSession(null);
  };

  const handleCompanyChange = (activeCompany: Broker) => {
    setInvoice(prev => ({ ...prev, broker: activeCompany }));
  };

  const handleActiveTemplateChange = (id: TemplateId) => setInvoice(prev => ({ ...prev, templateId: id }));

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-blue-600 rounded-3xl animate-bounce flex items-center justify-center text-white mb-6"><i className="fas fa-rocket text-2xl"></i></div>
      <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">UniversalSoft 1.0 ...</p>
    </div>
  );
  if (!session) return <AuthPage onLoginSuccess={handleLoginSuccess} />;

  const isAdmin = userProfile?.isAdmin;
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <aside className={`no-print bg-slate-100 h-screen overflow-y-auto transition-all duration-300 shadow-xl z-20 ${isSidebarOpen ? 'w-full md:w-[400px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xl shadow-md"><i className="fas fa-rocket"></i></div>
              <div><h1 className="font-bold text-lg text-slate-800 leading-tight">UniversalSoft</h1><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Gestão Empresarial</p></div>
            </div>
            <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center shadow-sm"><i className="fas fa-power-off text-sm"></i></button>
          </div>
          <nav className="flex flex-col gap-1.5 mb-8 bg-white/60 p-2 rounded-2xl border border-slate-200">
             <button onClick={() => setCurrentView('invoicing')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'invoicing' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><i className="fas fa-file-invoice w-5"></i> Facturação</button>
             <button onClick={() => setCurrentView('clients')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'clients' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><i className="fas fa-users w-5"></i> Clientes</button>
             <button onClick={() => setCurrentView('products')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><i className="fas fa-box w-5"></i> Produtos & Serviços</button>
             <button onClick={() => setCurrentView('saft')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'saft' ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><i className="fas fa-file-code w-5"></i> SAF-T AO</button>
             <div className="h-px bg-slate-200/50 mx-4 my-2"></div>
             <button onClick={() => setCurrentView('admin-companies')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'admin-companies' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}><i className="fas fa-cog w-5"></i> Configurações</button>
             {isAdmin && (
               <>
                 <button onClick={() => setCurrentView('server')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'server' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><i className="fas fa-server w-5"></i> Servidor & Backups</button>
                 <button onClick={() => setCurrentView('admin-users')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'admin-users' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}><i className="fas fa-user-shield w-5"></i> Utilizadores</button>
                 <button onClick={() => setCurrentView('admin-profiles')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'admin-profiles' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}><i className="fas fa-user-lock w-5"></i> Perfis de Acesso</button>
                 <button onClick={() => setCurrentView('admin-models')} className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center gap-3 ${currentView === 'admin-models' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}><i className="fas fa-palette w-5"></i> Layouts A4</button>
               </>
             )}
          </nav>
          <div className="mt-auto px-4 py-4 bg-white rounded-2xl border border-slate-200 mb-6 shadow-sm">
             <div className="flex items-center gap-2 text-[9px] font-black text-slate-700 uppercase tracking-widest"><i className="fas fa-user-circle text-blue-500"></i>{userProfile?.name}</div>
             <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">{userProfile?.role} • ACTIVADO</p>
          </div>
          {currentView === 'invoicing' ? (<InvoiceForm invoice={invoice} onChange={setInvoice} onGenerateAI={handleAINotes} isGenerating={isGeneratingNote} userProfile={userProfile} />) : (<button onClick={() => setCurrentView('invoicing')} className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><i className="fas fa-arrow-left"></i> Voltar à Facturação</button>)}
        </div>
      </aside>
      <main className="flex-1 h-screen overflow-y-auto bg-slate-200 relative flex justify-center items-start">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="no-print absolute top-6 left-6 z-30 w-10 h-10 bg-white shadow-xl rounded-xl text-slate-600 hover:text-blue-600 transition flex items-center justify-center border border-slate-200"><i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i></button>
        <div className="w-full min-h-full flex justify-center items-start py-8">
          {currentView === 'invoicing' && (<div id="invoice-capture-area" className="p-4 md:p-8 animate-in zoom-in duration-300"><InvoicePreview invoice={invoice} emissor={userProfile?.name} /></div>)}
          {currentView === 'clients' && <ClientManagementPage />}
          {currentView === 'products' && <ProductManagementPage />}
          {currentView === 'saft' && <SaftSubmissionPage />}
          {currentView === 'server' && <ServerManagementPage />}
          {currentView === 'admin-companies' && <AdminCompaniesPage onSelectActive={handleCompanyChange} activeCompanyId={invoice.broker.id} isAdmin={isAdmin || false} />}
          {isAdmin && currentView === 'admin-users' && <AdminUsersPage />}
          {isAdmin && currentView === 'admin-profiles' && <AdminProfilesPage />}
          {isAdmin && currentView === 'admin-models' && <AdminModelsPage onSelectActiveTemplate={handleActiveTemplateChange} />}
        </div>
      </main>
    </div>
  );
};
export default App;
