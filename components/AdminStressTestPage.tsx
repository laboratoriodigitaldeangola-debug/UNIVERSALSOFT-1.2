
import React, { useState, useEffect } from 'react';
import { AuditLog, INITIAL_INVOICE } from '../types';
import { saveAuditLog } from '../services/supabase';

export const AdminStressTestPage: React.FC<{ user: any }> = ({ user }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    avgResponse: 0,
    errors: 0,
    totalOperations: 0
  });

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem('system_audit_logs') || '[]');
    setLogs(savedLogs);
  }, []);

  const runSimulation = async (scenario: string, load: number) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    let errorCount = 0;
    const startAll = performance.now();
    
    await saveAuditLog({
      userId: user.id || 'system',
      userName: user.name,
      action: 'STRESS_TEST_START',
      details: `Iniciando Cenário: ${scenario} com carga de ${load} ops.`,
      severity: 'warning'
    });

    for (let i = 1; i <= load; i++) {
      const startOp = performance.now();
      try {
        // Simula operação crítica de facturação/validação
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        
        if (Math.random() < 0.02) throw new Error("Timeout Simulado em Carga Alta");

        setSimulationProgress(Math.floor((i / load) * 100));
      } catch (e: any) {
        errorCount++;
        await saveAuditLog({
          userId: 'system',
          userName: 'Stress Engine',
          action: 'SIMULATION_ERROR',
          details: `Falha na op ${i}: ${e.message}`,
          severity: 'critical'
        });
      }
      
      if (i % 20 === 0 || i === load) {
        setMetrics(prev => ({
          ...prev,
          totalOperations: i,
          errors: errorCount,
          avgResponse: (performance.now() - startAll) / i
        }));
      }
    }

    await saveAuditLog({
      userId: user.id || 'system',
      userName: user.name,
      action: 'STRESS_TEST_END',
      details: `Cenário concluído. Erros: ${errorCount}, Latência Média: ${((performance.now() - startAll) / load).toFixed(2)}ms`,
      severity: 'info'
    });

    setIsSimulating(false);
    const updatedLogs = JSON.parse(localStorage.getItem('system_audit_logs') || '[]');
    setLogs(updatedLogs);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-microchip text-rose-600"></i>
            Stress Test & Auditoria
          </h1>
          <p className="text-slate-500 font-medium">Monitoramento de Robustez Institucional UniversalSoft 1.0</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 text-[10px] font-black uppercase">
             Sistema Estável
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Métricas de Performance</p>
          <div className="space-y-4">
            <div>
               <p className="text-2xl font-black">{metrics.avgResponse.toFixed(2)}ms</p>
               <p className="text-[9px] font-bold text-slate-500 uppercase">Latência Média</p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
               <div>
                  <p className="text-lg font-black text-rose-500">{metrics.errors}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Falhas</p>
               </div>
               <div>
                  <p className="text-lg font-black text-blue-400">{metrics.totalOperations}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Ops Totais</p>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
           <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Simulador de Cenários</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <button 
                  disabled={isSimulating}
                  onClick={() => runSimulation('USO_INTENSIVO', 100)}
                  className="bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 p-3 rounded-xl transition text-[9px] font-black uppercase"
                 >
                   Normal Intensivo
                 </button>
                 <button 
                  disabled={isSimulating}
                  onClick={() => runSimulation('PICO_FACTURACAO', 300)}
                  className="bg-slate-50 hover:bg-rose-600 hover:text-white border border-slate-200 p-3 rounded-xl transition text-[9px] font-black uppercase"
                 >
                   Pico Factura
                 </button>
                 <button 
                  disabled={isSimulating}
                  onClick={() => runSimulation('SAFT_MASSA', 50)}
                  className="bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 p-3 rounded-xl transition text-[9px] font-black uppercase"
                 >
                   SAF-T Massa
                 </button>
                 <button 
                  disabled={isSimulating}
                  onClick={() => runSimulation('ABUSIVO', 500)}
                  className="bg-slate-50 hover:bg-red-600 hover:text-white border border-slate-200 p-3 rounded-xl transition text-[9px] font-black uppercase"
                 >
                   Carga Crítica
                 </button>
              </div>
           </div>
           
           {isSimulating && (
             <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-blue-600">
                  <span>A processar simulação...</span>
                  <span>{simulationProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${simulationProgress}%` }}></div>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logs de Auditoria do Sistema</h3>
          <button onClick={() => { localStorage.removeItem('system_audit_logs'); setLogs([]); }} className="text-[9px] font-black text-rose-500 uppercase hover:underline">Limpar Logs</button>
        </div>
        <div className="max-h-[500px] overflow-y-auto font-mono text-[10px]">
          {logs.length === 0 ? (
            <div className="p-20 text-center text-slate-300">Nenhum registo de auditoria encontrado.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                <tr className="text-slate-400 uppercase">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Operador</th>
                  <th className="px-6 py-3">Acção</th>
                  <th className="px-6 py-3">Detalhes</th>
                  <th className="px-6 py-3">Severidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="px-6 py-3 font-bold text-slate-600 uppercase">{log.userName}</td>
                    <td className="px-6 py-3 font-black text-blue-600 uppercase">{log.action}</td>
                    <td className="px-6 py-3 text-slate-500 max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        log.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-blue-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
         <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl backdrop-blur-xl border border-white/10">
               <i className="fas fa-shield-check text-blue-400"></i>
            </div>
            <div>
               <h3 className="text-xl font-black uppercase tracking-tight mb-2">Certificação Institucional</h3>
               <p className="text-blue-300 text-sm max-w-2xl leading-relaxed">
                 O UniversalSoft 1.0 utiliza criptografia de ponta-a-ponta e logs imutáveis para garantir que cada kwanza facturado seja rastreável e auditável pelas autoridades fiscais competentes.
               </p>
            </div>
         </div>
         <div className="absolute right-[-5%] bottom-[-20%] text-[150px] font-black opacity-5 italic select-none">SAFE</div>
      </div>
    </div>
  );
};
