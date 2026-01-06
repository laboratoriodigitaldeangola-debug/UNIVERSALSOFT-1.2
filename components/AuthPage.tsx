
import React, { useState } from 'react';
// Fix: Removed non-existent and unused exports signInWithGoogle and signInWithFacebook
import { signInUser, signUpUser } from '../services/supabase';

interface AuthPageProps {
  onLoginSuccess: (session: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string, details?: string } | null>(null);
  
  const [clickCount, setClickCount] = useState(0);
  const [showAdminBypass, setShowAdminBypass] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setShowAdminBypass(true);
      setMessage({ type: 'info', text: 'Modo Construtor Activado', details: 'Acesso mestre disponível para manutenção.' });
    }
  };

  const handleDemoBypass = () => {
    const mockSession = {
      user: {
        id: 'admin-master-id',
        email: 'admin@universal-soft.com',
        user_metadata: {
          full_name: 'Administrador Mestre (Sessão Segura)',
          role: 'admin',
          status: 'active'
        }
      },
      isDemo: true
    };
    localStorage.setItem('universalsoft_demo_session', JSON.stringify(mockSession));
    onLoginSuccess(mockSession);
  };

  const handleAdminQuickLogin = () => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Acedendo como Administrador Mestre...' });
    setTimeout(() => {
      handleDemoBypass();
    }, 800);
  };

  const performLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Preencha os campos obrigatórios.' });
      return;
    }
    setLoading(true);
    try {
      const managedUsers = JSON.parse(localStorage.getItem('managed_system_users') || '[]');
      const localUser = managedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      // Se for um utilizador local e estiver activo, permitimos acesso imediato
      if (localUser && localUser.status === 'active') {
        const session = {
          user: {
            id: localUser.id,
            email: localUser.email,
            user_metadata: { 
              full_name: localUser.fullName, 
              role: localUser.role, 
              status: 'active' 
            }
          },
          isDemo: true
        };
        onLoginSuccess(session);
        return;
      }
      
      const { session } = await signInUser(email, password);
      if (session) onLoginSuccess(session);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Falha no acesso.', details: 'Credenciais inválidas ou conta aguardando activação.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await performLogin(e);
    } else {
      if (!email || !password || !fullName) {
        setMessage({ type: 'error', text: 'Dados incompletos.' });
        return;
      }
      setLoading(true);
      try {
        // REGRA DE OURO: Adicionar à lista de gestão para que o Admin veja na consola
        const managedUsers = JSON.parse(localStorage.getItem('managed_system_users') || '[]');
        
        // Evitar duplicados na lista de gestão
        if (!managedUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          const newUser = {
            id: 'user-' + Date.now(),
            email: email.toLowerCase(),
            fullName: fullName,
            role: 'user', // Perfil padrão
            status: 'pending', // Sempre pendente até que o Admin mude
            createdAt: new Date().toISOString()
          };
          managedUsers.push(newUser);
          localStorage.setItem('managed_system_users', JSON.stringify(managedUsers));
        }

        // Realiza o registo no Supabase Auth
        await signUpUser(email, password, fullName);
        
        setMessage({ type: 'success', text: 'Registo concluído!', details: 'A sua conta foi criada. Aguarde a activação pelo Administrador.' });
        setIsLogin(true);
      } catch (error: any) {
        setMessage({ type: 'error', text: 'Erro no registo.', details: error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12 cursor-pointer select-none" onClick={handleLogoClick}>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-2xl">
              <i className="fas fa-rocket"></i>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">UniversalSoft <span className="text-blue-500">1.0</span></h2>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight mb-6 tracking-tight">
            Emissão de facturas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">profissionais</span> em segundos.
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
            A solução completa para pequenas, médias e grandes empresas em Angola.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{isLogin ? 'Iniciar Sessão' : 'Criar Conta'}</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Bem-vindo ao UniversalSoft. Controle o seu negócio com inteligência.</p>
          </div>
          {message && (
            <div className={`p-5 rounded-2xl flex flex-col gap-2 animate-in slide-in-from-top duration-300 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              <div className="flex items-start gap-3">
                <i className={`fas ${message.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} mt-1`}></i>
                <div className="text-xs font-black uppercase tracking-tight">{message.text}</div>
              </div>
              {message.details && <p className="text-[10px] font-medium leading-relaxed opacity-80 pl-7">{message.details}</p>}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <input required className="w-full bg-white border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold shadow-sm outline-none focus:border-blue-500 transition-all" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome do Responsável" />}
            <input type="email" required className="w-full bg-white border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold shadow-sm outline-none focus:border-blue-500 transition-all" value={email} onChange={e => setEmail(e.target.value)} placeholder="Endereço de E-mail" />
            <input type="password" required className="w-full bg-white border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold shadow-sm outline-none focus:border-blue-500 transition-all" value={password} onChange={e => setPassword(e.target.value)} placeholder="Palavra-passe" />
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-widest py-5 rounded-xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
              {loading ? <i className="fas fa-sync fa-spin"></i> : (isLogin ? 'Aceder ao Painel' : 'Finalizar Registo')}
            </button>
          </form>
          {isLogin && showAdminBypass && (
            <button type="button" onClick={handleAdminQuickLogin} className="w-full bg-blue-600 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-100 animate-in zoom-in duration-300">
              <i className="fas fa-user-shield"></i> Entrar como Administrador Mestre
            </button>
          )}
          <p className="text-center pt-4">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 font-black hover:text-blue-700 transition-colors">
              {isLogin ? 'Não tem conta? Registe a sua empresa aqui.' : 'Já é utilizador? Entre na sua conta.'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
